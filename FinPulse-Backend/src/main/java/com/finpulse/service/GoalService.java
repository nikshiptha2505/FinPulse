package com.finpulse.service;

import com.finpulse.dto.GoalDTO;
import com.finpulse.dto.GoalRequest;
import com.finpulse.entity.Goal;
import com.finpulse.entity.User;
import com.finpulse.repository.GoalRepository;
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
public class GoalService {

    private final GoalRepository goalRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public List<GoalDTO> getAll(String email) {
        return goalRepo.findByUser(findUser(email))
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public GoalDTO create(String email, GoalRequest req) {
        Goal g = Goal.builder()
                .name(req.name())
                .targetAmount(req.targetAmount())
                .savedAmount(req.savedAmount())
                .deadline(req.deadline())
                .icon(req.icon())
                .user(findUser(email))
                .build();
        return toDTO(goalRepo.save(g));
    }

    @Transactional
    public GoalDTO deposit(String email, Long id, BigDecimal amount) {
        Goal g = findOwned(email, id);
        g.setSavedAmount(g.getSavedAmount().add(amount));
        return toDTO(goalRepo.save(g));
    }

    @Transactional
    public GoalDTO update(String email, Long id, GoalRequest req) {
        Goal g = findOwned(email, id);
        g.setName(req.name());
        g.setTargetAmount(req.targetAmount());
        g.setSavedAmount(req.savedAmount());
        g.setDeadline(req.deadline());
        g.setIcon(req.icon());
        return toDTO(goalRepo.save(g));
    }

    @Transactional
    public void delete(String email, Long id) {
        goalRepo.delete(findOwned(email, id));
    }

    // ── helpers ────────────────────────────────────────────────────────────

    private Goal findOwned(String email, Long id) {
        Goal g = goalRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));
        if (!g.getUser().getEmail().equals(email))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return g;
    }

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private GoalDTO toDTO(Goal g) {
        return new GoalDTO(
                g.getId(), g.getName(), g.getTargetAmount(),
                g.getSavedAmount(), g.getDeadline(), g.getIcon());
    }
}
