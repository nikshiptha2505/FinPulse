package com.finpulse.dto;

import java.math.BigDecimal;

public record TransactionDTO(
    Long id,
    String description,
    BigDecimal amount,
    String category,
    String type,
    String date
) {}
