package com.example.acs.auth.dto;

import com.example.acs.user.UserEntity;
import com.example.acs.user.UserRole;
import java.util.UUID;

public record UserSummaryDto(
    UUID id, String username, UserRole role, long assignedSpaceBytes, long usedSpaceBytes) {

  public static UserSummaryDto fromEntity(UserEntity entity) {
    return new UserSummaryDto(
        entity.getId(),
        entity.getUsername(),
        entity.getRole(),
        entity.getAssignedSpaceBytes(),
        entity.getUsedSpaceBytes());
  }
}

