package com.fitnesstracker.repository;

import com.fitnesstracker.model.BodyWeight;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BodyWeightRepository extends JpaRepository<BodyWeight, Long> {
    List<BodyWeight> findAllByOrderByDateAsc();
    List<BodyWeight> findByUserIdOrderByDateAsc(String userId);
}
