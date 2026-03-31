package com.finpulse.dto;

import java.math.BigDecimal;

public record SummaryDTO(
    BigDecimal totalBalance,
    BigDecimal income,
    BigDecimal expenses,
    BigDecimal savings
) {}
