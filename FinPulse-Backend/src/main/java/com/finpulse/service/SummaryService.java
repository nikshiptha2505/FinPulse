package com.finpulse.service;

import com.finpulse.dto.SummaryDTO;
import com.finpulse.entity.User;
import com.finpulse.repository.TransactionRepository;
import com.finpulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final TransactionRepository txRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public SummaryDTO getMonthlySummary(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        BigDecimal income   = txRepo.sumByUserAndType(user.getId(), "INCOME");
        BigDecimal expenses = txRepo.sumByUserAndType(user.getId(), "EXPENSE");

        income   = income   == null ? BigDecimal.ZERO : income;
        expenses = expenses == null ? BigDecimal.ZERO : expenses;

        BigDecimal balance = income.subtract(expenses);
        return new SummaryDTO(balance, income, expenses, balance);
    }
}
