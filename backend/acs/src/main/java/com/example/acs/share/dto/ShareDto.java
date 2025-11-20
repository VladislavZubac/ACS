package com.example.acs.share.dto;

import com.example.acs.file.FileEntryEntity;
import com.example.acs.folder.FolderEntity;
import com.example.acs.share.ShareLinkEntity;
import java.time.Instant;
import java.util.UUID;

public record ShareDto(
    UUID id,
    String token,
    ShareTargetType targetType,
    UUID targetId,
    String targetName,
    Instant expiresAt,
    boolean revoked,
    Instant createdAt) {

  public static ShareDto fromEntity(ShareLinkEntity entity) {
    ShareTargetType type;
    UUID targetId;
    String targetName;
    if (entity.getFile() != null) {
      FileEntryEntity file = entity.getFile();
      type = ShareTargetType.FILE;
      targetId = file.getId();
      targetName = file.getOriginalName();
    } else if (entity.getFolder() != null) {
      FolderEntity folder = entity.getFolder();
      type = ShareTargetType.FOLDER;
      targetId = folder.getId();
      targetName = folder.getName();
    } else {
      type = ShareTargetType.FILE;
      targetId = null;
      targetName = "";
    }
    return new ShareDto(
        entity.getId(),
        entity.getToken(),
        type,
        targetId,
        targetName,
        entity.getExpiresAt(),
        entity.isRevoked(),
        entity.getCreatedAt());
  }
}

