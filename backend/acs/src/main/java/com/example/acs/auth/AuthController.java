package com.example.acs.auth;

import com.example.acs.auth.dto.AuthResponse;
import com.example.acs.auth.dto.LoginRequest;
import com.example.acs.auth.dto.SignupRequest;
import com.example.acs.auth.dto.UserSummaryDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

  private final AuthService authService;

  @PostMapping("/signup")
  @Operation(summary = "Зарегистрировать нового пользователя")
  public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
    return authService.signup(request);
  }

  @PostMapping("/login")
  @Operation(summary = "Выполнить вход и получить JWT")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @GetMapping("/me")
  @Operation(summary = "Получить профиль текущего пользователя")
  public UserSummaryDto me(@AuthenticationPrincipal(expression = "id") UUID userId) {
    return authService.currentUserSummaryById(userId);
  }
}

