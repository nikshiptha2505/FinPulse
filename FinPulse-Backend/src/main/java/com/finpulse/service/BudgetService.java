package com.finpulse.service;

import com.finpulse.dto.BudgetDTO;
import com.finpulse.dto.BudgetProgressDTO;
import com.finpulse.dto.BudgetRequest;
import com.finpulse.entity.Budget;
import com.finpulse.entity.User;
import com.finpulse.repository.BudgetRepository;
import com.finpulse.repository.TransactionRepository;
import com.finpulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepo;
    private final TransactionRepository txRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public List<BudgetDTO> getAll(String email) {
        return budgetRepo.findByUser(findUser(email))
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<BudgetProgressDTO> getProgress(String email) {
        User user = findUser(email);
        return budgetRepo.findByUser(user).stream().map(b -> {
            BigDecimal spent = txRepo.sumExpensesByUserAndCategoryAndMonth(
                    user.getId(), b.getCategory(), b.getMonth());
            return new BudgetProgressDTO(
                    b.getId(), b.getCategory(), b.getLimitAmount(),
                    spent == null ? BigDecimal.ZERO : spent,
                    b.getMonth());
        }).toList();
    }

    @Transactional
    public BudgetDTO create(String email, BudgetRequest req) {
        Budget b = Budget.builder()
                .category(req.category())
                .limitAmount(req.limit())
                .month(req.month())
                .user(findUser(email))
                .build();
        return toDTO(budgetRepo.save(b));
    }

    @Transactional
    public BudgetDTO update(String email, Long id, BudgetRequest req) {
        Budget b = findOwned(email, id);
        b.setCategory(req.category());
        b.setLimitAmount(req.limit());
        b.setMonth(req.month());
        return toDTO(budgetRepo.save(b));
    }

    @Transactional
    public void delete(String email, Long id) {
        budgetRepo.delete(findOwned(email, id));
    }

    // ── helpers ────────────────────────────────────────────────────────────

    private Budget findOwned(String email, Long id) {
        Budget b = budgetRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
        if (!b.getUser().getEmail().equals(email))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return b;
    }

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private BudgetDTO toDTO(Budget b) {
        return new BudgetDTO(b.getId(), b.getCategory(), b.getLimitAmount(), b.getMonth());
    }
}
