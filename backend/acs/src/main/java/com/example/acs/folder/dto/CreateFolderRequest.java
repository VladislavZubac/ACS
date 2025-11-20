package com.example.acs.folder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateFolderRequest(
    @NotBlank @Size(min = 1, max = 128) String name,
    UUID parentFolderId) {
}

