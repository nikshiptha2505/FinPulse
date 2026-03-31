package com.finpulse.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BudgetRequest(
    @NotBlank String category,
    @NotNull @DecimalMin("1") BigDecimal limit,
    @NotBlank String month  // "2025-03"
) {}
