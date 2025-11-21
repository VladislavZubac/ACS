package com.example.acs.quota.dto;

import com.example.acs.user.UserEntity;

public record QuotaDto(long assignedSpaceBytes, long usedSpaceBytes) {

  public static QuotaDto fromUser(UserEntity user) {
    return new QuotaDto(user.getAssignedSpaceBytes(), user.getUsedSpaceBytes());
  }
}


