package com.example.acs.file;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FileEntryRepository extends JpaRepository<FileEntryEntity, UUID> {

  List<FileEntryEntity> findByUser_Id(UUID userId);

  List<FileEntryEntity> findByUser_IdAndFolder_Id(UUID userId, UUID folderId);

  List<FileEntryEntity> findByUser_IdAndFolderIsNull(UUID userId);

  Optional<FileEntryEntity> findByStorageFilename(String storageFilename);

  long countByUser_Id(UUID userId);

  @Query(
      "select coalesce(sum(f.sizeBytes), 0) from FileEntryEntity f where f.user.id = :userId")
  long sumFileSizeBytesByUserId(UUID userId);
}

