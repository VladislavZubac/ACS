package com.example.acs.file;

import com.example.acs.file.preview.PreviewService;
import com.example.acs.folder.FolderEntity;
import com.example.acs.folder.FolderRepository;
import com.example.acs.quota.QuotaService;
import com.example.acs.share.ShareLinkRepository;
import com.example.acs.storage.FileStorage;
import com.example.acs.storage.StoredFile;
import com.example.acs.user.UserEntity;
import com.example.acs.user.UserRepository;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

  private final FileEntryRepository fileEntryRepository;
  private final FolderRepository folderRepository;
  private final UserRepository userRepository;
  private final FileStorage fileStorage;
  private final QuotaService quotaService;
  private final ShareLinkRepository shareLinkRepository;
  private final PreviewService previewService;

  @Transactional
  public FileEntryEntity uploadFile(UUID userId, UUID folderId, MultipartFile multipartFile) {
    UserEntity user = getUserOrThrow(userId);
    FolderEntity folder = resolveFolder(user, folderId);
    long declaredSize = multipartFile.getSize();
    long sizeForQuota = declaredSize > 0 ? declaredSize : multipartFile.getSize();
    quotaService.ensureCanStore(user, sizeForQuota);

    String folderPath = folder != null ? folder.getPath() : "";
    StoredFile storedFile;
    try (InputStream inputStream = multipartFile.getInputStream()) {
      storedFile =
          fileStorage.store(
              user.getId(),
              folderPath,
              multipartFile.getOriginalFilename() != null
                  ? multipartFile.getOriginalFilename()
                  : "file",
              inputStream);
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file", e);
    }

    quotaService.increaseUsage(user, storedFile.sizeBytes());

    FileEntryEntity fileEntry =
        FileEntryEntity.builder()
            .user(user)
            .folder(folder)
            .originalName(
                multipartFile.getOriginalFilename() != null
                    ? multipartFile.getOriginalFilename()
                    : multipartFile.getName())
            .storageFilename(storedFile.storageFilename())
            .sizeBytes(storedFile.sizeBytes())
            .mimeType(
                multipartFile.getContentType() != null
                    ? multipartFile.getContentType()
                    : "application/octet-stream")
            .previewGenerated(false)
            .build();

    FileEntryEntity saved = fileEntryRepository.save(fileEntry);
    previewService.schedulePreviewGeneration(saved);
    log.info(
        "User '{}' uploaded file '{}' ({} bytes)",
        user.getUsername(),
        saved.getOriginalName(),
        saved.getSizeBytes());
    return saved;
  }

  public List<FileEntryEntity> listFiles(UUID userId, UUID folderId) {
    if (folderId == null) {
      return fileEntryRepository.findByUser_IdAndFolderIsNull(userId);
    }
    folderRepository
        .findById(folderId)
        .filter(folder -> folder.getUser().getId().equals(userId))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
    return fileEntryRepository.findByUser_IdAndFolder_Id(userId, folderId);
  }

  public FileEntryEntity getFile(UUID userId, UUID fileId) {
    return fileEntryRepository
        .findById(fileId)
        .filter(file -> file.getUser().getId().equals(userId))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
  }

  public Resource loadFile(UUID userId, UUID fileId) {
    FileEntryEntity file = getFile(userId, fileId);
    String folderPath = file.getFolder() != null ? file.getFolder().getPath() : "";
    return fileStorage.load(userId, folderPath, file.getStorageFilename());
  }

  public Resource loadPreview(UUID userId, UUID fileId) {
    FileEntryEntity file = getFile(userId, fileId);
    return previewService.loadPreview(file);
  }

  @Transactional
  public void deleteFile(UUID userId, UUID fileId) {
    UserEntity user = getUserOrThrow(userId);
    FileEntryEntity file = getFile(userId, fileId);
    deleteFileEntity(user, file);
    log.info("User '{}' deleted file '{}'", user.getUsername(), file.getOriginalName());
  }

  @Transactional
  public void deleteFilesInFolder(UserEntity user, FolderEntity folder) {
    List<FileEntryEntity> files = fileEntryRepository.findByUser_IdAndFolder_Id(user.getId(), folder.getId());
    files.forEach(file -> deleteFileEntity(user, file));
  }

  private void deleteFileEntity(UserEntity user, FileEntryEntity file) {
    String folderPath = file.getFolder() != null ? file.getFolder().getPath() : "";
    previewService.deletePreviewIfExists(file);
    fileStorage.delete(user.getId(), folderPath, file.getStorageFilename());
    shareLinkRepository.deleteByFile(file);
    fileEntryRepository.delete(file);
    quotaService.decreaseUsage(user, file.getSizeBytes());
  }

  private FolderEntity resolveFolder(UserEntity user, UUID folderId) {
    if (folderId == null) {
      return null;
    }
    return folderRepository
        .findById(folderId)
        .filter(folder -> folder.getUser().getId().equals(user.getId()))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
  }

  private UserEntity getUserOrThrow(UUID userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }
}

