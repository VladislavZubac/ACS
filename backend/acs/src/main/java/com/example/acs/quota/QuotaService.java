package com.example.acs.quota;

import com.example.acs.file.FileEntryRepository;
import com.example.acs.user.UserEntity;
import com.example.acs.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuotaService {

  private final UserRepository userRepository;
  private final FileEntryRepository fileEntryRepository;

  public void ensureCanStore(UserEntity user, long bytesToAdd) {
    long available = user.getAssignedSpaceBytes() - user.getUsedSpaceBytes();
    if (bytesToAdd > available) {
      log.warn(
          "User '{}' quota exceeded. Requested: {} bytes, available: {}",
          user.getUsername(),
          bytesToAdd,
          available);
      throw new ResponseStatusException(
          HttpStatus.PAYLOAD_TOO_LARGE, "Storage quota exceeded for user " + user.getUsername());
    }
  }

  @Transactional
  public void increaseUsage(UserEntity user, long bytes) {
    user.setUsedSpaceBytes(user.getUsedSpaceBytes() + bytes);
    userRepository.save(user);
  }

  @Transactional
  public void decreaseUsage(UserEntity user, long bytes) {
    long newValue = Math.max(0, user.getUsedSpaceBytes() - bytes);
    user.setUsedSpaceBytes(newValue);
    userRepository.save(user);
  }

  @Transactional
  public void recalculateUsage(UserEntity user) {
    long actual = fileEntryRepository.sumFileSizeBytesByUserId(user.getId());
    user.setUsedSpaceBytes(actual);
    userRepository.save(user);
    log.info("Recalculated used space for user '{}': {} bytes", user.getUsername(), actual);
  }
}

