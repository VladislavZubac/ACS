package com.example.acs.admin;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayDeque;
import java.util.Deque;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AdminLogsService {

  private final Path logFilePath;

  public AdminLogsService(@Value("${logging.file.name:logs/acs.log}") String logFile) {
    if (!StringUtils.hasText(logFile)) {
      this.logFilePath = Paths.get("logs", "acs.log").toAbsolutePath().normalize();
    } else {
      this.logFilePath = Paths.get(logFile).toAbsolutePath().normalize();
    }
  }

  public String getTail(int tail) {
    int targetLines = Math.max(1, Math.min(tail, 10_000));

    if (!Files.exists(logFilePath) || !Files.isRegularFile(logFilePath)) {
      return "";
    }

    Deque<String> buffer = new ArrayDeque<>(targetLines);
    try (BufferedReader reader =
        Files.newBufferedReader(logFilePath, StandardCharsets.UTF_8)) {
      String line;
      while ((line = reader.readLine()) != null) {
        buffer.addLast(line);
        if (buffer.size() > targetLines) {
          buffer.removeFirst();
        }
      }
    } catch (IOException ex) {
      throw new RuntimeException("Failed to read admin log file", ex);
    }

    return String.join(System.lineSeparator(), buffer);
  }
}


