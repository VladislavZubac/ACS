package com.example.acs.file;

import com.example.acs.common.model.AuditableEntity;
import com.example.acs.folder.FolderEntity;
import com.example.acs.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@Entity
@Table(
    name = "file_entries",
    indexes = {
      @Index(name = "idx_file_entries_user", columnList = "user_id"),
      @Index(name = "idx_file_entries_folder", columnList = "folder_id")
    },
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_file_entries_storage_filename",
          columnNames = "storage_filename")
    })
public class FileEntryEntity extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @EqualsAndHashCode.Include
  @JdbcTypeCode(SqlTypes.CHAR)
  private UUID id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "folder_id")
  private FolderEntity folder;

  @Column(name = "original_name", nullable = false, length = 255)
  private String originalName;

  @Column(name = "storage_filename", nullable = false, length = 255)
  private String storageFilename;

  @Column(name = "size_bytes", nullable = false)
  private long sizeBytes;

  @Column(name = "mime_type", nullable = false, length = 128)
  private String mimeType;

  @Column(name = "content_hash", length = 128)
  private String hash;

  @Column(name = "preview_generated", nullable = false)
  private boolean previewGenerated;

  @Column(name = "preview_path", length = 255)
  private String previewPath;
}

