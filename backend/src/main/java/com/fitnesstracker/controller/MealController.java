package com.fitnesstracker.controller;

import com.fitnesstracker.model.DietLog;
import com.fitnesstracker.model.Meal;
import com.fitnesstracker.repository.DietLogRepository;
import com.fitnesstracker.repository.MealRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    private final MealRepository mealRepository;
    private final DietLogRepository dietLogRepository;

    public MealController(MealRepository mealRepository, DietLogRepository dietLogRepository) {
        this.mealRepository = mealRepository;
        this.dietLogRepository = dietLogRepository;
    }

    @GetMapping
    public List<Meal> getAll() {
        return mealRepository.findAll();
    }

    @PostMapping
    public Meal create(@RequestBody Meal meal) {
        meal.setCustom(true);
        return mealRepository.save(meal);
    }

    @PutMapping("/{id}")
    public Meal update(@PathVariable Long id, @RequestBody Meal meal) {
        meal.setId(id);
        meal.setCustom(true);
        return mealRepository.save(meal);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        List<DietLog> refs = dietLogRepository.findByMealId(id);
        for (DietLog log : refs) {
            Meal meal = log.getMeal();
            if (meal != null && log.getCustomName() == null) {
                log.setCustomName(meal.getName());
            }
            log.setMeal(null);
        }
        dietLogRepository.saveAll(refs);
        mealRepository.deleteById(id);
    }
}
