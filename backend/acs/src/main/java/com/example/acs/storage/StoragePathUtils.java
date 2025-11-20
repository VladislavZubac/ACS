package com.example.acs.storage;

import java.nio.file.Path;
import java.util.UUID;
import lombok.experimental.UtilityClass;

@UtilityClass
public class StoragePathUtils {

  public static Path resolveUserFolderPath(Path root, UUID userId, String folderPath) {
    Path userRoot = root.resolve(userId.toString());
    String normalized = normalizeFolderPath(folderPath);
    if (normalized.isEmpty()) {
      return userRoot;
    }
    return userRoot.resolve(normalized);
  }

  public static String normalizeFolderPath(String folderPath) {
    if (folderPath == null || folderPath.isBlank() || "/".equals(folderPath.trim())) {
      return "";
    }
    String cleaned = folderPath.trim();
    if (cleaned.startsWith("/")) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.endsWith("/")) {
      cleaned = cleaned.substring(0, cleaned.length() - 1);
    }
    return cleaned.replace("//", "/");
  }

  public static Path resolveFilePath(Path root, UUID userId, String folderPath, String storageFilename) {
    return resolveUserFolderPath(root, userId, folderPath).resolve(storageFilename);
  }
}

