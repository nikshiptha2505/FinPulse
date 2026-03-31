package com.finpulse.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TransactionRequest(
    @NotBlank String description,
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    @NotBlank String category,
    @NotBlank String type,   // "INCOME" | "EXPENSE"
    @NotBlank String date    // "2025-03-28"
) {}
