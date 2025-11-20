package com.example.acs.admin;

import com.example.acs.admin.dto.AdminSummaryDto;
import com.example.acs.admin.dto.AdminUserDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Stats")
public class AdminStatsController {

  private final AdminStatsService statsService;
  private final AdminUserService adminUserService;

  @GetMapping("/summary")
  @Operation(summary = "Админ: общая сводка")
  public AdminSummaryDto getSummary() {
    return statsService.getSummary();
  }

  @GetMapping("/users")
  @Operation(summary = "Админ: список пользователей")
  public List<AdminUserDto> getUsers() {
    return adminUserService.listUsers();
  }
}

