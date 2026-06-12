package com.fitnesstracker.repository;

import com.fitnesstracker.model.BodyWeight;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BodyWeightRepository extends JpaRepository<BodyWeight, Long> {
    List<BodyWeight> findAllByOrderByDateAsc();
    List<BodyWeight> findByUserIdOrderByDateAsc(String userId);
    Optional<BodyWeight> findByUserIdAndDate(String userId, LocalDate date);
    List<BodyWeight> findByUserIdAndDateBetweenOrderByDateAsc(String userId, LocalDate from, LocalDate to);
}
