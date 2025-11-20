package com.example.acs.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateQuotaRequest(
    @NotNull @Min(1) Long assignedSpaceBytes) {}

