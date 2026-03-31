package com.finpulse.repository;

import com.finpulse.entity.Budget;
import com.finpulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
}
