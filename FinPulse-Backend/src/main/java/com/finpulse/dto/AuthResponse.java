package com.finpulse.dto;

public record AuthResponse(
    String token,
    String name,
    String email
) {}
