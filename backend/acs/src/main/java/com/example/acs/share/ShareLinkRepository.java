package com.example.acs.share;

import com.example.acs.file.FileEntryEntity;
import com.example.acs.folder.FolderEntity;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShareLinkRepository extends JpaRepository<ShareLinkEntity, UUID> {

  Optional<ShareLinkEntity> findByToken(String token);

  List<ShareLinkEntity> findByOwnerUser_Id(UUID ownerId);

  List<ShareLinkEntity> findByExpiresAtBefore(Instant cutoff);

  void deleteByFile(FileEntryEntity file);

  void deleteByFolder(FolderEntity folder);
}

