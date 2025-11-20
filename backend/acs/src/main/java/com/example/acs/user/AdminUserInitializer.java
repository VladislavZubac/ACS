package com.example.acs.user;

import com.example.acs.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements ApplicationRunner {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AppProperties appProperties;

  @Override
  public void run(ApplicationArguments args) {
    AppProperties.AdminUserProperties adminProps = appProperties.getAdmin();
    if (!StringUtils.hasText(adminProps.getUsername())
        || !StringUtils.hasText(adminProps.getPassword())) {
      log.warn("Admin user credentials are not configured. Skipping admin bootstrap.");
      return;
    }

    String normalizedUsername = adminProps.getUsername().trim().toLowerCase();
    userRepository
        .findByUsername(normalizedUsername)
        .ifPresentOrElse(
            existing -> log.info("Admin user '{}' already exists", normalizedUsername),
            () -> {
              UserEntity admin =
                  UserEntity.builder()
                      .username(normalizedUsername)
                      .passwordHash(passwordEncoder.encode(adminProps.getPassword()))
                      .role(UserRole.ADMIN)
                      .assignedSpaceBytes(adminProps.getAssignedSpaceBytes())
                      .usedSpaceBytes(0)
                      .build();
              userRepository.save(admin);
              log.info("Admin user '{}' has been created", normalizedUsername);
            });
  }
}

