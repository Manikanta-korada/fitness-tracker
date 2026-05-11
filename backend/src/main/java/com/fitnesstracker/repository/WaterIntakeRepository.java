package com.fitnesstracker.repository;

import com.fitnesstracker.model.WaterIntake;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WaterIntakeRepository extends JpaRepository<WaterIntake, Long> {
    List<WaterIntake> findByDate(LocalDate date);
    List<WaterIntake> findByDateBetween(LocalDate from, LocalDate to);
}
