package com.example.acs.folder;

import com.example.acs.file.FileService;
import com.example.acs.file.dto.FileDto;
import com.example.acs.folder.dto.CreateFolderRequest;
import com.example.acs.folder.dto.FolderContentDto;
import com.example.acs.folder.dto.FolderDto;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
@Tag(name = "Folders")
public class FolderController {

  private final FolderService folderService;
  private final FileService fileService;

  @PostMapping
  @Operation(summary = "Создать новую папку")
  public FolderDto createFolder(
      @AuthenticationPrincipal(expression = "id") UUID userId,
      @Valid @RequestBody CreateFolderRequest request) {
    return FolderDto.fromEntity(
        folderService.createFolder(userId, request.name(), request.parentFolderId()));
  }

  @GetMapping
  @Operation(summary = "Получить список подпапок")
  public List<FolderDto> listFolders(
      @AuthenticationPrincipal(expression = "id") UUID userId,
      @RequestParam(value = "parentId", required = false) UUID parentId) {
    return folderService.listChildren(userId, parentId).stream()
        .map(FolderDto::fromEntity)
        .toList();
  }

  @GetMapping("/{id}")
  @Operation(summary = "Получить папку с содержимым")
  public FolderContentDto getFolder(
      @AuthenticationPrincipal(expression = "id") UUID userId, @PathVariable("id") UUID folderId) {
    var folder = folderService.getFolder(userId, folderId);
    var children =
        folderService.listChildren(userId, folderId).stream()
            .map(FolderDto::fromEntity)
            .toList();
    var files =
        fileService.listFiles(userId, folderId).stream()
            .map(FileDto::fromEntity)
            .toList();
    return new FolderContentDto(FolderDto.fromEntity(folder), children, files);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Удалить папку рекурсивно")
  public ResponseEntity<Void> deleteFolder(
      @AuthenticationPrincipal(expression = "id") UUID userId, @PathVariable("id") UUID folderId) {
    folderService.deleteFolder(userId, folderId);
    return ResponseEntity.noContent().build();
  }
}

