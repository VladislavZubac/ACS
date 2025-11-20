package com.example.acs.share;

import com.example.acs.share.dto.CreateShareRequest;
import com.example.acs.share.dto.ShareDto;
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
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
@Tag(name = "Share")
public class ShareController {

  private final ShareService shareService;

  @PostMapping
  @Operation(summary = "Создать публичную ссылку на файл или папку")
  public ShareDto createShare(
      @AuthenticationPrincipal(expression = "id") UUID userId,
      @Valid @RequestBody CreateShareRequest request) {
    return ShareDto.fromEntity(shareService.createShare(userId, request));
  }

  @GetMapping
  @Operation(summary = "Получить список своих ссылок")
  public List<ShareDto> listShares(@AuthenticationPrincipal(expression = "id") UUID userId) {
    return shareService.listShares(userId).stream().map(ShareDto::fromEntity).toList();
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Отозвать ссылку")
  public ResponseEntity<Void> revokeShare(
      @AuthenticationPrincipal(expression = "id") UUID userId, @PathVariable("id") UUID shareId) {
    shareService.revokeShare(userId, shareId);
    return ResponseEntity.noContent().build();
  }
}

