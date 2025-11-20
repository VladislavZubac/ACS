package com.example.acs.storage;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

  /**
   * Корневой каталог для пользовательских файлов.
   */
  private String rootPath = "backend/cloud";

  public String getRootPath() {
    return rootPath;
  }

  public void setRootPath(String rootPath) {
    this.rootPath = rootPath;
  }

  public Path getRootPathAsPath() {
    return Paths.get(rootPath).toAbsolutePath().normalize();
  }
}

