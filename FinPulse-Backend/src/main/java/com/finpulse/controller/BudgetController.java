package com.finpulse.controller;

import com.finpulse.dto.BudgetDTO;
import com.finpulse.dto.BudgetProgressDTO;
import com.finpulse.dto.BudgetRequest;
import com.finpulse.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getAll(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(budgetService.getAll(user.getUsername()));
    }

    @GetMapping("/progress")
    public ResponseEntity<List<BudgetProgressDTO>> getProgress(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(budgetService.getProgress(user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(budgetService.create(user.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetDTO> update(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.update(user.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        budgetService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
