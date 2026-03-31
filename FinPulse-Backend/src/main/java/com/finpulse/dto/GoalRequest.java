package com.finpulse.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record GoalRequest(
    @NotBlank String name,
    @NotNull @DecimalMin("1") BigDecimal targetAmount,
    @NotNull @DecimalMin("0") BigDecimal savedAmount,
    @NotBlank String deadline,
    String icon
) {}
