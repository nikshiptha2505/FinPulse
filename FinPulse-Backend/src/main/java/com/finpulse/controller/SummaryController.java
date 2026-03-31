package com.finpulse.controller;

import com.finpulse.dto.SummaryDTO;
import com.finpulse.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping
    public ResponseEntity<SummaryDTO> getSummary(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
                summaryService.getMonthlySummary(user.getUsername()));
    }
}
