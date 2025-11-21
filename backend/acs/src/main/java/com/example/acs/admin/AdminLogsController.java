package com.example.acs.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/admin/logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Logs")
public class AdminLogsController {

  private final AdminLogsService logsService;

  @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
  @Operation(summary = "Админ: получить хвост лога backend")
  public ResponseEntity<String> getLogs(
      @RequestParam(name = "tail", defaultValue = "500") int tail) {
    String content = logsService.getTail(tail);
    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_PLAIN)
        .body(content);
  }
}


