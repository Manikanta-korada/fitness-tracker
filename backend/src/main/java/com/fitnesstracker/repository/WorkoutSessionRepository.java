package com.fitnesstracker.repository;

import com.fitnesstracker.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByDateBetween(LocalDate from, LocalDate to);
    List<WorkoutSession> findByDate(LocalDate date);
    List<WorkoutSession> findByUserId(String userId);
    List<WorkoutSession> findByUserIdAndDateBetween(String userId, LocalDate from, LocalDate to);

    @Query("SELECT s.date, COUNT(s) FROM WorkoutSession s WHERE s.userId = :userId AND s.date BETWEEN :from AND :to GROUP BY s.date")
    List<Object[]> countByUserIdAndDateBetween(@Param("userId") String userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT DISTINCT s FROM WorkoutSession s LEFT JOIN FETCH s.entries e LEFT JOIN FETCH e.exercise LEFT JOIN FETCH e.sets WHERE s.userId = :userId AND s.date = :date")
    List<WorkoutSession> findByUserIdAndDateWithDetails(@Param("userId") String userId, @Param("date") LocalDate date);
}
