package com.fitnesstracker.repository;

import com.fitnesstracker.model.DailyTarget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyTargetRepository extends JpaRepository<DailyTarget, Long> {
}
