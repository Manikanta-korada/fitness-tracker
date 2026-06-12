package com.fitnesstracker.repository;

import com.fitnesstracker.model.DietLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface DietLogRepository extends JpaRepository<DietLog, Long> {
    List<DietLog> findByDate(LocalDate date);
    List<DietLog> findByDateBetween(LocalDate from, LocalDate to);
    List<DietLog> findByUserIdAndDate(String userId, LocalDate date);
    List<DietLog> findByUserIdAndDateBetween(String userId, LocalDate from, LocalDate to);
    List<DietLog> findByUserIdAndCustomNameContaining(String userId, String customNamePart);
    List<DietLog> findByMealId(Long mealId);
}
