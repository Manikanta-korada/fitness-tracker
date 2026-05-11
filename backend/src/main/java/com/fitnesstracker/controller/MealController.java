package com.fitnesstracker.controller;

import com.fitnesstracker.model.Meal;
import com.fitnesstracker.repository.MealRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    private final MealRepository mealRepository;

    public MealController(MealRepository mealRepository) {
        this.mealRepository = mealRepository;
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
        return mealRepository.save(meal);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        mealRepository.deleteById(id);
    }
}
