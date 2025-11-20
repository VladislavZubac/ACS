package com.example.acs.common.api;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ErrorResponse> handleResponseStatus(
      ResponseStatusException ex, HttpServletRequest request) {
    ErrorResponse body =
        ErrorResponse.of(
            ex.getStatusCode() instanceof HttpStatus httpStatus ? httpStatus : HttpStatus.BAD_REQUEST,
            ex.getReason() != null ? ex.getReason() : "Request failed",
            request.getRequestURI());
    return ResponseEntity.status(ex.getStatusCode()).body(body);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    List<ErrorResponse.ValidationError> errors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(fieldError -> new ErrorResponse.ValidationError(fieldError.getField(), defaultMessage(fieldError)))
            .collect(Collectors.toList());
    ErrorResponse body =
        ErrorResponse.withValidation(
            HttpStatus.BAD_REQUEST, "Validation failed", request.getRequestURI(), errors);
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
    ErrorResponse body =
        ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error", request.getRequestURI());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  }

  private String defaultMessage(FieldError fieldError) {
    return fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Invalid value";
  }
}

