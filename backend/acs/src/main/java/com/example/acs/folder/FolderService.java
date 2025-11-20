package com.example.acs.folder;

import com.example.acs.file.FileService;
import com.example.acs.share.ShareLinkRepository;
import com.example.acs.user.UserEntity;
import com.example.acs.user.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class FolderService {

  private final FolderRepository folderRepository;
  private final UserRepository userRepository;
  private final FileService fileService;
  private final ShareLinkRepository shareLinkRepository;

  @Transactional
  public FolderEntity createFolder(UUID userId, String name, UUID parentFolderId) {
    UserEntity user = getUserOrThrow(userId);
    FolderEntity parent = resolveFolder(user, parentFolderId);
    String sanitizedName = sanitizeName(name);
    String newPath = buildPath(parent, sanitizedName);

    if (folderRepository.existsByUser_IdAndPath(user.getId(), newPath)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Folder already exists at path " + newPath);
    }

    FolderEntity folder =
        FolderEntity.builder()
            .user(user)
            .name(sanitizedName)
            .parentFolder(parent)
            .path(newPath)
            .build();

    FolderEntity saved = folderRepository.save(folder);
    log.info("User '{}' created folder '{}' ({})", user.getUsername(), sanitizedName, newPath);
    return saved;
  }

  public List<FolderEntity> listRootFolders(UUID userId) {
    return folderRepository.findByUser_IdAndParentFolderIsNull(userId);
  }

  public List<FolderEntity> listChildren(UUID userId, UUID parentId) {
    if (parentId == null) {
      return listRootFolders(userId);
    }
    FolderEntity parent = getFolder(userId, parentId);
    return folderRepository.findByParentFolder_Id(parent.getId());
  }

  public FolderEntity getFolder(UUID userId, UUID folderId) {
    return folderRepository
        .findById(folderId)
        .filter(folder -> folder.getUser().getId().equals(userId))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
  }

  @Transactional
  public void deleteFolder(UUID userId, UUID folderId) {
    UserEntity user = getUserOrThrow(userId);
    FolderEntity folder = getFolder(userId, folderId);
    deleteRecursively(user, folder);
    log.info("User '{}' deleted folder '{}' ({})", user.getUsername(), folder.getName(), folder.getPath());
  }

  private void deleteRecursively(UserEntity user, FolderEntity folder) {
    List<FolderEntity> children = folderRepository.findByParentFolder_Id(folder.getId());
    children.forEach(child -> deleteRecursively(user, child));
    fileService.deleteFilesInFolder(user, folder);
    shareLinkRepository.deleteByFolder(folder);
    folderRepository.delete(folder);
  }

  private FolderEntity resolveFolder(UserEntity user, UUID folderId) {
    if (folderId == null) {
      return null;
    }
    return getFolder(user.getId(), folderId);
  }

  private UserEntity getUserOrThrow(UUID userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }

  private String sanitizeName(String name) {
    if (!StringUtils.hasText(name)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder name is required");
    }
    String trimmed = name.trim();
    if (trimmed.contains("/")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder name cannot contain '/'");
    }
    return trimmed;
  }

  private String buildPath(FolderEntity parent, String name) {
    if (parent == null || !StringUtils.hasText(parent.getPath())) {
      return "/" + name;
    }
    return parent.getPath() + "/" + name;
  }
}

