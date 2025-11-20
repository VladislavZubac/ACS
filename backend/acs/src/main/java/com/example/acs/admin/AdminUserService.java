package com.example.acs.admin;

import com.example.acs.admin.dto.AdminUserDto;
import com.example.acs.admin.dto.UpdateQuotaRequest;
import com.example.acs.user.UserEntity;
import com.example.acs.user.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminUserService {

  private final UserRepository userRepository;

  public List<AdminUserDto> listUsers() {
    return userRepository.findAllByOrderByUsernameAsc().stream()
        .map(AdminUserDto::fromEntity)
        .toList();
  }

  @Transactional
  public AdminUserDto updateQuota(UUID userId, UpdateQuotaRequest request) {
    UserEntity user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    long newQuota = request.assignedSpaceBytes();
    if (newQuota < user.getUsedSpaceBytes()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "New quota cannot be less than currently used space");
    }

    user.setAssignedSpaceBytes(newQuota);
    UserEntity saved = userRepository.save(user);
    return AdminUserDto.fromEntity(saved);
  }
}

