package com.finpulse.dto;

import java.math.BigDecimal;

public record GoalDTO(
    Long id,
    String name,
    BigDecimal targetAmount,
    BigDecimal savedAmount,
    String deadline,
    String icon
) {}
