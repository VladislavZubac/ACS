package com.example.acs.admin.dto;

public record AdminSummaryDto(
    long totalUsers,
    long totalFiles,
    long totalAssignedBytes,
    long totalUsedBytes) {}

