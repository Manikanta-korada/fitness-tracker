package com.fitnesstracker.repository;

import com.fitnesstracker.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealRepository extends JpaRepository<Meal, Long> {
}
