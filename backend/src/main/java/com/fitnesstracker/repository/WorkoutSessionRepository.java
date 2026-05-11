package com.fitnesstracker.repository;

import com.fitnesstracker.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByDateBetween(LocalDate from, LocalDate to);
    List<WorkoutSession> findByDate(LocalDate date);
}
