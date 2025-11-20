package com.example.acs.file.preview;

import com.example.acs.file.FileEntryEntity;
import com.example.acs.file.FileEntryRepository;
import com.example.acs.storage.FileStorage;
import com.example.acs.storage.StorageProperties;
import jakarta.transaction.Transactional;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreviewService {

  private static final int PREVIEW_MAX_WIDTH = 512;
  private static final int PREVIEW_MAX_HEIGHT = 512;

  private final FileEntryRepository fileEntryRepository;
  private final FileStorage fileStorage;
  private final StorageProperties storageProperties;

  public void schedulePreviewGeneration(FileEntryEntity file) {
    if (file == null || !isPreviewSupported(file)) {
      return;
    }
    generatePreviewAsync(file.getId());
  }

  @Async("previewExecutor")
  @Transactional
  public void generatePreviewAsync(UUID fileId) {
    fileEntryRepository
        .findById(fileId)
        .filter(this::isPreviewSupported)
        .ifPresent(
            file -> {
              try {
                generatePreview(file);
              } catch (Exception ex) {
                log.warn("Failed to generate preview for file {}: {}", file.getId(), ex.getMessage());
              }
            });
  }

  public Resource loadPreview(FileEntryEntity file) {
    if (file == null || !file.isPreviewGenerated() || file.getPreviewPath() == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Preview not available");
    }
    try {
      Path previewPath =
          storageProperties
              .getRootPathAsPath()
              .resolve(file.getUser().getId().toString())
              .resolve(file.getPreviewPath());
      Resource resource = new UrlResource(previewPath.toUri());
      if (!resource.exists() || !resource.isReadable()) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Preview not found");
      }
      return resource;
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read preview", e);
    }
  }

  private boolean isPreviewSupported(FileEntryEntity file) {
    if (file.isPreviewGenerated()) {
      return false;
    }
    String mimeType = file.getMimeType();
    return mimeType != null && mimeType.startsWith("image/");
  }

  private void generatePreview(FileEntryEntity file) throws IOException {
    String folderPath = file.getFolder() != null ? file.getFolder().getPath() : "";
    Resource original = fileStorage.load(file.getUser().getId(), folderPath, file.getStorageFilename());
    try (InputStream inputStream = original.getInputStream()) {
      BufferedImage originalImage = ImageIO.read(inputStream);
      if (originalImage == null) {
        log.warn("Unsupported image format for file {}", file.getId());
        return;
      }
      BufferedImage previewImage = resizeImage(originalImage);
      Path previewFile =
          resolvePreviewFile(file.getUser().getId(), file.getStorageFilename() + ".png");
      Files.createDirectories(previewFile.getParent());
      ImageIO.write(previewImage, "png", previewFile.toFile());
      file.setPreviewGenerated(true);
      file.setPreviewPath(".previews/" + previewFile.getFileName());
      fileEntryRepository.save(file);
      log.debug("Generated preview for file {}", file.getId());
    }
  }

  private Path resolvePreviewFile(UUID userId, String filename) {
    return storageProperties
        .getRootPathAsPath()
        .resolve(userId.toString())
        .resolve(".previews")
        .resolve(filename);
  }

  private BufferedImage resizeImage(BufferedImage originalImage) {
    int width = originalImage.getWidth();
    int height = originalImage.getHeight();
    double widthRatio = (double) PREVIEW_MAX_WIDTH / width;
    double heightRatio = (double) PREVIEW_MAX_HEIGHT / height;
    double ratio = Math.min(1.0, Math.min(widthRatio, heightRatio));
    int targetWidth = (int) Math.max(1, Math.round(width * ratio));
    int targetHeight = (int) Math.max(1, Math.round(height * ratio));

    Image scaledImage = originalImage.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH);
    BufferedImage preview = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_ARGB);
    Graphics2D graphics = preview.createGraphics();
    graphics.drawImage(scaledImage, 0, 0, null);
    graphics.dispose();
    return preview;
  }

  public void deletePreviewIfExists(FileEntryEntity file) {
    if (file == null || !file.isPreviewGenerated() || file.getPreviewPath() == null) {
      return;
    }
    try {
      Path previewPath =
          storageProperties
              .getRootPathAsPath()
              .resolve(file.getUser().getId().toString())
              .resolve(file.getPreviewPath());
      Files.deleteIfExists(previewPath);
    } catch (IOException e) {
      log.debug("Failed to delete preview for file {}: {}", file.getId(), e.getMessage());
    }
  }
}

