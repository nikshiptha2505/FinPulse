package com.finpulse.controller;

import com.finpulse.dto.DepositRequest;
import com.finpulse.dto.GoalDTO;
import com.finpulse.dto.GoalRequest;
import com.finpulse.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalDTO>> getAll(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(goalService.getAll(user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<GoalDTO> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody GoalRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(goalService.create(user.getUsername(), request));
    }

    @PatchMapping("/{id}/deposit")
    public ResponseEntity<GoalDTO> deposit(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody DepositRequest request) {
        return ResponseEntity.ok(
                goalService.deposit(user.getUsername(), id, request.amount()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDTO> update(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.ok(goalService.update(user.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        goalService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
