package com.finpulse.repository;

import com.finpulse.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
        SELECT t FROM Transaction t
        WHERE t.user.id = :userId
          AND (:category IS NULL OR t.category = :category)
          AND (:type IS NULL OR CAST(t.type AS string) = :type)
        ORDER BY t.date DESC
    """)
    Page<Transaction> findByUserAndOptionalFilters(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("type") String type,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND CAST(t.type AS string) = :type")
    BigDecimal sumByUserAndType(
            @Param("userId") Long userId,
            @Param("type") String type);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        WHERE t.user.id   = :userId
          AND CAST(t.type AS string) = 'EXPENSE'
          AND t.category  = :category
          AND FUNCTION('TO_CHAR', t.date, 'YYYY-MM') = :month
    """)
    BigDecimal sumExpensesByUserAndCategoryAndMonth(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("month") String month);
}
