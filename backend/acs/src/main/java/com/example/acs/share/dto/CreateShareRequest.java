package com.example.acs.share.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateShareRequest(
    UUID fileId,
    UUID folderId,
    @NotNull ShareTtlOption ttl) {

  @jakarta.validation.constraints.AssertTrue(message = "Provide either fileId or folderId (but not both)")
  public boolean hasExactlyOneTarget() {
    return (fileId != null) ^ (folderId != null);
  }
}

