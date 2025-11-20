package com.example.acs.file;

import com.example.acs.file.dto.FileDto;
import jakarta.validation.constraints.NotNull;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files")
public class FileController {

  private final FileService fileService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Загрузить файл")
  public FileDto uploadFile(
      @AuthenticationPrincipal(expression = "id") UUID userId,
      @RequestParam("file") @NotNull MultipartFile file,
      @RequestParam(value = "folderId", required = false) UUID folderId) {
    return FileDto.fromEntity(fileService.uploadFile(userId, folderId, file));
  }

  @GetMapping
  @Operation(summary = "Получить список файлов в папке/корне")
  public List<FileDto> listFiles(
      @AuthenticationPrincipal(expression = "id") UUID userId,
      @RequestParam(value = "folderId", required = false) UUID folderId) {
    return fileService.listFiles(userId, folderId).stream().map(FileDto::fromEntity).toList();
  }

  @GetMapping("/{id}")
  @Operation(summary = "Получить метаданные файла")
  public FileDto getFile(
      @AuthenticationPrincipal(expression = "id") UUID userId, @PathVariable("id") UUID fileId) {
    return FileDto.fromEntity(fileService.getFile(userId, fileId));
  }

  @GetMapping("/{id}/download")
  @Operation(summary = "Скачать файл")
  public ResponseEntity<Resource> downloadFile(
      @AuthenticationPrincipal(expression = "id") UUID userId, @PathVariable("id") UUID fileId) {
    var file = fileService.getFile(userId, fileId);
    Resource resource = fileService.loadFile(userId, fileId);

    String encodedFileName = URLEncoder.encode(file.getOriginalName(), StandardCharsets.UTF_8);
    ContentDisposition contentDisposition =
        ContentDisposition.attachment().filename(encodedFileName).build();

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
        .contentType(MediaType.parseMediaType(file.getMimeType()))
        .contentLength(file.getSizeBytes())
        .body(resource);
  }

  @GetMapping("/{id}/preview")
  @Operation(summary = "Получить PNG-превью изображения, если доступно")
  public ResponseEntity<Resource> previewFile(
      @AuthenticationPrincipal(expression = "id") UUID userId, @PathVariable("id") UUID fileId) {
    Resource resource = fileService.loadPreview(userId, fileId);
    return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(resource);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Удалить файл")
  public ResponseEntity<Void> deleteFile(
      @AuthenticationPrincipal(expression = "id") UUID userId, @PathVariable("id") UUID fileId) {
    fileService.deleteFile(userId, fileId);
    return ResponseEntity.noContent().build();
  }
}

