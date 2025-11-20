package com.example.acs.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

  private final UserDefaultsProperties userDefaults = new UserDefaultsProperties();
  private final AdminUserProperties admin = new AdminUserProperties();
  private List<String> corsAllowedOrigins = new ArrayList<>(List.of("http://localhost:3000"));

  public UserDefaultsProperties getUserDefaults() {
    return userDefaults;
  }

  public AdminUserProperties getAdmin() {
    return admin;
  }

  public List<String> getCorsAllowedOrigins() {
    return corsAllowedOrigins;
  }

  public void setCorsAllowedOrigins(List<String> corsAllowedOrigins) {
    this.corsAllowedOrigins = corsAllowedOrigins;
  }

  public static class UserDefaultsProperties {
    /**
     * Базовый объём, выделяемый новым пользователям (в байтах).
     */
    private long assignedSpaceBytes = 5L * 1024 * 1024 * 1024;

    public long getAssignedSpaceBytes() {
      return assignedSpaceBytes;
    }

    public void setAssignedSpaceBytes(long assignedSpaceBytes) {
      this.assignedSpaceBytes = assignedSpaceBytes;
    }
  }

  public static class AdminUserProperties {
    private String username = "admin";
    private String password = "admin12345";
    private long assignedSpaceBytes = 100L * 1024 * 1024 * 1024;

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }

    public long getAssignedSpaceBytes() {
      return assignedSpaceBytes;
    }

    public void setAssignedSpaceBytes(long assignedSpaceBytes) {
      this.assignedSpaceBytes = assignedSpaceBytes;
    }
  }
}

