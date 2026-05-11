package com.fitnesstracker.repository;

import com.fitnesstracker.model.SleepLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface SleepLogRepository extends JpaRepository<SleepLog, Long> {
    List<SleepLog> findByDate(LocalDate date);
    List<SleepLog> findByDateBetween(LocalDate from, LocalDate to);
    List<SleepLog> findByUserIdAndDate(String userId, LocalDate date);
    List<SleepLog> findByUserIdAndDateBetween(String userId, LocalDate from, LocalDate to);
}
