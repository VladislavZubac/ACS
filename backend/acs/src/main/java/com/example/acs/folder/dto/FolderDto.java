package com.example.acs.folder.dto;

import com.example.acs.folder.FolderEntity;
import java.time.Instant;
import java.util.UUID;

public record FolderDto(
    UUID id,
    String name,
    String path,
    UUID parentFolderId,
    Instant createdAt,
    Instant updatedAt) {

  public static FolderDto fromEntity(FolderEntity entity) {
    return new FolderDto(
        entity.getId(),
        entity.getName(),
        entity.getPath(),
        entity.getParentFolder() != null ? entity.getParentFolder().getId() : null,
        entity.getCreatedAt(),
        entity.getUpdatedAt());
  }
}

