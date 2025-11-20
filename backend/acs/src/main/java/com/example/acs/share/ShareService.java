package com.example.acs.share;

import com.example.acs.config.CacheNames;
import com.example.acs.file.FileEntryEntity;
import com.example.acs.file.FileEntryRepository;
import com.example.acs.file.FileService;
import com.example.acs.file.dto.FileDto;
import com.example.acs.folder.FolderEntity;
import com.example.acs.folder.FolderRepository;
import com.example.acs.folder.dto.FolderDto;
import com.example.acs.share.dto.CreateShareRequest;
import com.example.acs.share.dto.ShareDto;
import com.example.acs.share.dto.SharePublicDto;
import com.example.acs.user.UserEntity;
import com.example.acs.user.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShareService {

  private final ShareLinkRepository shareLinkRepository;
  private final FileEntryRepository fileEntryRepository;
  private final FolderRepository folderRepository;
  private final UserRepository userRepository;
  private final FileService fileService;

  @Transactional
  @CacheEvict(cacheNames = CacheNames.SHARE_LINKS, allEntries = true)
  public ShareLinkEntity createShare(UUID ownerId, CreateShareRequest request) {
    ShareLinkEntity shareLink = new ShareLinkEntity();
    shareLink.setOwnerUser(getOwner(ownerId));
    shareLink.setToken(generateToken());
    shareLink.setExpiresAt(Instant.now().plus(request.ttl().duration()));
    shareLink.setRevoked(false);

    if (request.fileId() != null) {
      FileEntryEntity file = getFile(ownerId, request.fileId());
      shareLink.setFile(file);
    } else if (request.folderId() != null) {
      FolderEntity folder = getFolder(ownerId, request.folderId());
      shareLink.setFolder(folder);
    }

    ShareLinkEntity saved = shareLinkRepository.save(shareLink);
    log.info("User '{}' created share '{}'", shareLink.getOwnerUser().getUsername(), saved.getToken());
    return saved;
  }

  public List<ShareLinkEntity> listShares(UUID ownerId) {
    return shareLinkRepository.findByOwnerUser_Id(ownerId);
  }

  @Transactional
  @CacheEvict(cacheNames = CacheNames.SHARE_LINKS, allEntries = true)
  public void revokeShare(UUID ownerId, UUID shareId) {
    ShareLinkEntity share =
        shareLinkRepository
            .findById(shareId)
            .filter(s -> s.getOwnerUser().getId().equals(ownerId))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Share not found"));
    share.setRevoked(true);
    shareLinkRepository.save(share);
    log.info("User '{}' revoked share '{}'", share.getOwnerUser().getUsername(), share.getToken());
  }

  @Cacheable(cacheNames = CacheNames.SHARE_LINKS, key = "#token")
  public ShareLinkEntity getShareByTokenCached(String token) {
    return shareLinkRepository
        .findByToken(token)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Share not found"));
  }

  public SharePublicDto getPublicShare(String token) {
    ShareLinkEntity share = validateShare(token);
    ShareDto shareDto = ShareDto.fromEntity(share);
    if (share.getFile() != null) {
      FileDto fileDto = FileDto.fromEntity(share.getFile());
      return new SharePublicDto(shareDto, fileDto, null, null);
    } else if (share.getFolder() != null) {
      FolderDto folderDto = FolderDto.fromEntity(share.getFolder());
      List<FileDto> files =
          fileService.listFiles(share.getFolder().getUser().getId(), share.getFolder().getId()).stream()
              .map(FileDto::fromEntity)
              .toList();
      return new SharePublicDto(shareDto, null, folderDto, files);
    }
    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Broken share");
  }

  public Resource downloadSharedFile(String token) {
    ShareLinkEntity share = validateShare(token);
    if (share.getFile() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Share does not reference a file");
    }
    return fileService.loadFile(share.getOwnerUser().getId(), share.getFile().getId());
  }

  public ShareLinkEntity getActiveShare(String token) {
    return validateShare(token);
  }

  private ShareLinkEntity validateShare(String token) {
    ShareLinkEntity share = getShareByTokenCached(token);
    if (share.isRevoked()) {
      throw new ResponseStatusException(HttpStatus.GONE, "Share revoked");
    }
    if (share.getExpiresAt() != null && share.getExpiresAt().isBefore(Instant.now())) {
      throw new ResponseStatusException(HttpStatus.GONE, "Share expired");
    }
    return share;
  }

  private FileEntryEntity getFile(UUID ownerId, UUID fileId) {
    return fileEntryRepository
        .findById(fileId)
        .filter(file -> file.getUser().getId().equals(ownerId))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
  }

  private FolderEntity getFolder(UUID ownerId, UUID folderId) {
    return folderRepository
        .findById(folderId)
        .filter(folder -> folder.getUser().getId().equals(ownerId))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
  }

  private UserEntity getOwner(UUID ownerId) {
    return userRepository
        .findById(ownerId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }

  private String generateToken() {
    return UUID.randomUUID().toString().replace("-", "");
  }
}

