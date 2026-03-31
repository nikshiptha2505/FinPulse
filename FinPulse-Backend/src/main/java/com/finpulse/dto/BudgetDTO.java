package com.finpulse.dto;

import java.math.BigDecimal;

public record BudgetDTO(
    Long id,
    String category,
    BigDecimal limitAmount,
    String month
) {}
