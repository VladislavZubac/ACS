package com.example.acs.admin;

import com.example.acs.admin.dto.AdminSummaryDto;
import com.example.acs.file.FileEntryRepository;
import com.example.acs.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

  private final UserRepository userRepository;
  private final FileEntryRepository fileEntryRepository;

  public AdminSummaryDto getSummary() {
    long totalUsers = userRepository.count();
    long totalFiles = fileEntryRepository.count();
    long totalAssigned = userRepository.sumAssignedSpaceBytes();
    long totalUsed = userRepository.sumUsedSpaceBytes();
    return new AdminSummaryDto(totalUsers, totalFiles, totalAssigned, totalUsed);
  }
}

