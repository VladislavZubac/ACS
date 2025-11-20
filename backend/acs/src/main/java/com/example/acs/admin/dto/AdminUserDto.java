package com.example.acs.admin.dto;

import com.example.acs.user.UserEntity;
import com.example.acs.user.UserRole;
import java.util.UUID;

public record AdminUserDto(
    UUID id,
    String username,
    UserRole role,
    long assignedSpaceBytes,
    long usedSpaceBytes) {

  public static AdminUserDto fromEntity(UserEntity entity) {
    return new AdminUserDto(
        entity.getId(),
        entity.getUsername(),
        entity.getRole(),
        entity.getAssignedSpaceBytes(),
        entity.getUsedSpaceBytes());
  }
}

