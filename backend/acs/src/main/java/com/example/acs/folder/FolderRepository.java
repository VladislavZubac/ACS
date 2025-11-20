package com.example.acs.folder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderRepository extends JpaRepository<FolderEntity, UUID> {

  List<FolderEntity> findByUser_Id(UUID userId);

  List<FolderEntity> findByUser_IdAndParentFolderIsNull(UUID userId);

  List<FolderEntity> findByParentFolder_Id(UUID parentId);

  Optional<FolderEntity> findByUser_IdAndPath(UUID userId, String path);

  boolean existsByUser_IdAndPath(UUID userId, String path);
}

