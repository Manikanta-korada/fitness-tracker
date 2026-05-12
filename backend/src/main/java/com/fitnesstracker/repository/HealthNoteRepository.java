package com.fitnesstracker.repository;

import com.fitnesstracker.model.HealthNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface HealthNoteRepository extends JpaRepository<HealthNote, Long> {
    List<HealthNote> findByUserIdAndDate(String userId, LocalDate date);
    List<HealthNote> findByUserIdAndDateBetween(String userId, LocalDate from, LocalDate to);
    List<HealthNote> findByUserIdOrderByDateDesc(String userId);
}
