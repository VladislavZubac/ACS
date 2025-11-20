package com.example.acs.storage;

import java.nio.file.Path;

public record StoredFile(String storageFilename, long sizeBytes, Path absolutePath) {
}

