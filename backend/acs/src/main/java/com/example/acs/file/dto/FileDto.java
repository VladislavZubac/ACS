package com.example.acs.file.dto;

import com.example.acs.file.FileEntryEntity;
import java.time.Instant;
import java.util.UUID;

public record FileDto(
    UUID id,
    String originalName,
    UUID folderId,
    long sizeBytes,
    String mimeType,
    Instant createdAt,
    Instant updatedAt) {

  public static FileDto fromEntity(FileEntryEntity entity) {
    return new FileDto(
        entity.getId(),
        entity.getOriginalName(),
        entity.getFolder() != null ? entity.getFolder().getId() : null,
        entity.getSizeBytes(),
        entity.getMimeType(),
        entity.getCreatedAt(),
        entity.getUpdatedAt());
  }
}

