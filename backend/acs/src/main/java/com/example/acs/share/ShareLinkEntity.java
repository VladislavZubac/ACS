package com.example.acs.share;

import com.example.acs.common.model.AuditableEntity;
import com.example.acs.file.FileEntryEntity;
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
import java.time.Instant;
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
    name = "share_links",
    indexes = {
      @Index(name = "idx_share_links_token", columnList = "token"),
      @Index(name = "idx_share_links_owner", columnList = "owner_user_id")
    })
public class ShareLinkEntity extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @EqualsAndHashCode.Include
  @JdbcTypeCode(SqlTypes.CHAR)
  private UUID id;

  @Column(nullable = false, unique = true, length = 64)
  private String token;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_user_id", nullable = false)
  private UserEntity ownerUser;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "file_id")
  private FileEntryEntity file;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "folder_id")
  private FolderEntity folder;

  @Column(name = "expires_at")
  private Instant expiresAt;

  @Column(name = "revoked", nullable = false)
  private boolean revoked;

  public boolean isExpired(Instant now) {
    return (expiresAt != null && expiresAt.isBefore(now)) || revoked;
  }
}

