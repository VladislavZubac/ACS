package com.example.acs.share.dto;

import com.fasterxml.jackson.annotation.JsonValue;
import java.time.Duration;

public enum ShareTtlOption {
  H1(Duration.ofHours(1)),
  H24(Duration.ofHours(24)),
  D7(Duration.ofDays(7)),
  D30(Duration.ofDays(30));

  private final Duration duration;

  ShareTtlOption(Duration duration) {
    this.duration = duration;
  }

  public Duration duration() {
    return duration;
  }

  @JsonValue
  public String jsonValue() {
    return name();
  }
}

