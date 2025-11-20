package com.example.acs.folder.dto;

import com.example.acs.file.dto.FileDto;
import java.util.List;

public record FolderContentDto(FolderDto folder, List<FolderDto> children, List<FileDto> files) {
}

