package com.finpulse.dto;

import java.math.BigDecimal;

public record BudgetProgressDTO(
    Long id,
    String category,
    BigDecimal limit,
    BigDecimal spent,
    String month
) {}
