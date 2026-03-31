package com.finpulse.controller;

import com.finpulse.dto.*;
import com.finpulse.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /** GET /api/transactions?page=0&size=20&category=Food&type=EXPENSE */
    @GetMapping
    public ResponseEntity<Page<TransactionDTO>> getAll(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(transactionService.getAll(user.getUsername(), page, size, category, type));
    }

    /** GET /api/transactions/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getById(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getById(user.getUsername(), id));
    }

    /** POST /api/transactions */
    @PostMapping
    public ResponseEntity<TransactionDTO> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody TransactionRequest request) {
        TransactionDTO created = transactionService.create(user.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** PUT /api/transactions/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> update(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.update(user.getUsername(), id, request));
    }

    /** DELETE /api/transactions/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        transactionService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
