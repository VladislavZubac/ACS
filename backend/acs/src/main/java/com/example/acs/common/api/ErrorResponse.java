package com.example.acs.common.api;

import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;

public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    List<ValidationError> validationErrors) {

  public static ErrorResponse of(HttpStatus status, String message, String path) {
    return new ErrorResponse(Instant.now(), status.value(), status.getReasonPhrase(), message, path, List.of());
  }

  public static ErrorResponse withValidation(
      HttpStatus status, String message, String path, List<ValidationError> errors) {
    return new ErrorResponse(Instant.now(), status.value(), status.getReasonPhrase(), message, path, errors);
  }

  public record ValidationError(String field, String message) {}
}

