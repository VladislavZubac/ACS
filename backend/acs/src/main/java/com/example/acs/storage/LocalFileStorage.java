package com.example.acs.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.util.FileSystemUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class LocalFileStorage implements FileStorage {

  private final StorageProperties properties;

  @Override
  public StoredFile store(UUID userId, String folderPath, String originalFilename, InputStream data) {
    Path targetDir = StoragePathUtils.resolveUserFolderPath(properties.getRootPathAsPath(), userId, folderPath);
    try {
      Files.createDirectories(targetDir);
      String storageFilename = UUID.randomUUID().toString();
      Path targetFile = targetDir.resolve(storageFilename);
      long bytes = Files.copy(data, targetFile, StandardCopyOption.REPLACE_EXISTING);
      log.debug("Stored file '{}' for user {} at {}", originalFilename, userId, targetFile);
      return new StoredFile(storageFilename, bytes, targetFile);
    } catch (IOException e) {
      throw new StorageException("Failed to store file %s".formatted(originalFilename), e);
    }
  }

  @Override
  public Resource load(UUID userId, String folderPath, String storageFilename) {
    try {
      Path filePath =
          StoragePathUtils.resolveFilePath(properties.getRootPathAsPath(), userId, folderPath, storageFilename);
      Resource resource = new UrlResource(filePath.toUri());
      if (!resource.exists() || !resource.isReadable()) {
        throw new StorageException("File not found: " + storageFilename);
      }
      return resource;
    } catch (IOException e) {
      throw new StorageException("Failed to read file " + storageFilename, e);
    }
  }

  @Override
  public void delete(UUID userId, String folderPath, String storageFilename) {
    Path filePath = StoragePathUtils.resolveFilePath(properties.getRootPathAsPath(), userId, folderPath, storageFilename);
    try {
      FileSystemUtils.deleteRecursively(filePath);
    } catch (IOException e) {
      throw new StorageException("Failed to delete file " + storageFilename, e);
    }
  }
}

