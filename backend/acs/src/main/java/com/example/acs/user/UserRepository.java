package com.example.acs.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

  Optional<UserEntity> findByUsername(String username);

  boolean existsByUsername(String username);

  List<UserEntity> findAllByOrderByUsernameAsc();

  @Query("select coalesce(sum(u.assignedSpaceBytes), 0) from UserEntity u")
  long sumAssignedSpaceBytes();

  @Query("select coalesce(sum(u.usedSpaceBytes), 0) from UserEntity u")
  long sumUsedSpaceBytes();
}

