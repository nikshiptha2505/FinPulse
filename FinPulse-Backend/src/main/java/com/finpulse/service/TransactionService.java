package com.finpulse.service;

import com.finpulse.dto.TransactionDTO;
import com.finpulse.dto.TransactionRequest;
import com.finpulse.entity.Transaction;
import com.finpulse.entity.User;
import com.finpulse.repository.TransactionRepository;
import com.finpulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public Page<TransactionDTO> getAll(String email, int page, int size, String category, String type) {
        User user = findUser(email);
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        return transactionRepo.findByUserAndOptionalFilters(user.getId(), category, type, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public TransactionDTO getById(String email, Long id) {
        return toDTO(findOwned(email, id));
    }

    @Transactional
    public TransactionDTO create(String email, TransactionRequest req) {
        User user = findUser(email);
        Transaction t = Transaction.builder()
                .description(req.description())
                .amount(req.amount())
                .category(req.category())
                .type(Transaction.TransactionType.valueOf(req.type().toUpperCase()))
                .date(LocalDate.parse(req.date()))
                .user(user)
                .build();
        return toDTO(transactionRepo.save(t));
    }

    @Transactional
    public TransactionDTO update(String email, Long id, TransactionRequest req) {
        Transaction t = findOwned(email, id);
        t.setDescription(req.description());
        t.setAmount(req.amount());
        t.setCategory(req.category());
        t.setType(Transaction.TransactionType.valueOf(req.type().toUpperCase()));
        t.setDate(LocalDate.parse(req.date()));
        return toDTO(transactionRepo.save(t));
    }

    @Transactional
    public void delete(String email, Long id) {
        transactionRepo.delete(findOwned(email, id));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Transaction findOwned(String email, Long id) {
        Transaction t = transactionRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        if (!t.getUser().getEmail().equals(email))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return t;
    }

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private TransactionDTO toDTO(Transaction t) {
        return new TransactionDTO(
                t.getId(), t.getDescription(), t.getAmount(),
                t.getCategory(), t.getType().name(), t.getDate().toString()
        );
    }
}
