package com.example.acs.share;

import com.example.acs.file.dto.FileDto;
import com.example.acs.share.dto.SharePublicDto;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/public/share")
@RequiredArgsConstructor
@Tag(name = "Public Share")
public class SharePublicController {

  private final ShareService shareService;

  @GetMapping("/{token}")
  @Operation(summary = "Получить публичную ссылку по токену")
  public SharePublicDto getPublicShare(@PathVariable("token") String token) {
    return shareService.getPublicShare(token);
  }

  @GetMapping("/{token}/download")
  @Operation(summary = "Скачать файл по публичной ссылке")
  public ResponseEntity<Resource> downloadSharedFile(@PathVariable("token") String token) {
    SharePublicDto dto = shareService.getPublicShare(token);
    if (dto.file() == null) {
      return ResponseEntity.badRequest().build();
    }
    Resource resource = shareService.downloadSharedFile(token);
    FileDto file = dto.file();
    String encodedFileName = URLEncoder.encode(file.originalName(), StandardCharsets.UTF_8);
    ContentDisposition contentDisposition =
        ContentDisposition.attachment().filename(encodedFileName).build();
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
        .contentType(MediaType.parseMediaType(file.mimeType()))
        .contentLength(file.sizeBytes())
        .body(resource);
  }
}

