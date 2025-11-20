package com.example.acs.auth;

import com.example.acs.auth.dto.AuthResponse;
import com.example.acs.auth.dto.LoginRequest;
import com.example.acs.auth.dto.SignupRequest;
import com.example.acs.auth.dto.UserSummaryDto;
import com.example.acs.config.AppProperties;
import com.example.acs.security.JwtService;
import com.example.acs.user.UserEntity;
import com.example.acs.user.UserRepository;
import com.example.acs.user.UserRole;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AppProperties appProperties;

  @Transactional
  public AuthResponse signup(SignupRequest request) {
    String normalizedUsername = request.username().trim().toLowerCase();
    if (userRepository.existsByUsername(normalizedUsername)) {
      log.warn("Attempt to register existing username: {}", normalizedUsername);
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
    }

    UserEntity user =
        UserEntity.builder()
            .username(normalizedUsername)
            .passwordHash(passwordEncoder.encode(request.password()))
            .role(UserRole.USER)
            .assignedSpaceBytes(appProperties.getUserDefaults().getAssignedSpaceBytes())
            .usedSpaceBytes(0)
            .build();

    UserEntity saved = userRepository.save(user);
    log.info("New user '{}' registered with role {}", normalizedUsername, saved.getRole());
    return buildAuthResponse(saved);
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    String normalizedUsername = request.username().trim().toLowerCase();
    UserEntity user =
        userRepository
            .findByUsername(normalizedUsername)
            .orElseThrow(
                () -> {
                  log.warn("Failed login: user '{}' not found", normalizedUsername);
                  return new ResponseStatusException(
                      HttpStatus.UNAUTHORIZED, "Invalid credentials");
                });

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      log.warn("Failed login for user '{}': bad password", normalizedUsername);
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    log.info("User '{}' logged in successfully", normalizedUsername);
    return buildAuthResponse(user);
  }

  @Transactional(readOnly = true)
  public UserSummaryDto currentUserSummaryById(UUID userId) {
    return userRepository
        .findById(userId)
        .map(UserSummaryDto::fromEntity)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }

  private AuthResponse buildAuthResponse(UserEntity user) {
    String token = jwtService.generateToken(user);
    return new AuthResponse(token, UserSummaryDto.fromEntity(user));
  }
}

