package com.example.acs.quota;

import com.example.acs.quota.dto.QuotaDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quota")
@RequiredArgsConstructor
@Tag(name = "Quota")
public class QuotaController {

  private final QuotaService quotaService;

  @GetMapping
  @Operation(summary = "Получить квоту текущего пользователя")
  public QuotaDto getQuota(@AuthenticationPrincipal(expression = "id") UUID userId) {
    return quotaService.getQuota(userId);
  }
}


