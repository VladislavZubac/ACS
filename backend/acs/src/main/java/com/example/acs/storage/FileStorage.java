package com.example.acs.storage;

import java.io.InputStream;
import java.util.UUID;
import org.springframework.core.io.Resource;

public interface FileStorage {

  StoredFile store(UUID userId, String folderPath, String originalFilename, InputStream data);

  Resource load(UUID userId, String folderPath, String storageFilename);

  void delete(UUID userId, String folderPath, String storageFilename);
}

