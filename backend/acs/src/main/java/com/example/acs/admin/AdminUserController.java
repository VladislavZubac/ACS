package com.example.acs.admin;

import com.example.acs.admin.dto.AdminUserDto;
import com.example.acs.admin.dto.UpdateQuotaRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Users")
public class AdminUserController {

  private final AdminUserService adminUserService;

  @PatchMapping("/{id}/quota")
  @Operation(summary = "Админ: изменить лимит пользователя")
  public AdminUserDto updateQuota(
      @PathVariable("id") UUID userId, @Valid @RequestBody UpdateQuotaRequest request) {
    return adminUserService.updateQuota(userId, request);
  }
}

