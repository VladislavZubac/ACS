package com.example.acs.folder;

import com.example.acs.common.model.AuditableEntity;
import com.example.acs.file.FileEntryEntity;
import com.example.acs.user.UserEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.HashSet;
import java.util.Set;
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
    name = "folders",
    indexes = {
      @Index(name = "idx_folders_user", columnList = "user_id"),
      @Index(name = "idx_folders_parent", columnList = "parent_folder_id")
    },
    uniqueConstraints = {
      @UniqueConstraint(name = "uk_folders_user_path", columnNames = {"user_id", "path"})
    })
public class FolderEntity extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @EqualsAndHashCode.Include
  @JdbcTypeCode(SqlTypes.CHAR)
  private UUID id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  @Column(nullable = false, length = 128)
  private String name;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_folder_id")
  private FolderEntity parentFolder;

  @OneToMany(mappedBy = "parentFolder", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<FolderEntity> children = new HashSet<>();

  @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<FileEntryEntity> files = new HashSet<>();

  /**
   * Кешированный путь вида `/docs/personal`.
   */
  @Column(nullable = false, length = 512)
  private String path;
}

