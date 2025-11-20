package com.example.acs.share.dto;

import com.example.acs.file.dto.FileDto;
import com.example.acs.folder.dto.FolderDto;
import java.util.List;

public record SharePublicDto(
    ShareDto share,
    FileDto file,
    FolderDto folder,
    List<FileDto> folderFiles) {}

