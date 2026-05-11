package com.fitnesstracker.controller;

import com.fitnesstracker.model.DietLog;
import com.fitnesstracker.model.Meal;
import com.fitnesstracker.repository.DietLogRepository;
import com.fitnesstracker.repository.MealRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/diet")
public class DietController {

    private final DietLogRepository dietLogRepository;
    private final MealRepository mealRepository;

    public DietController(DietLogRepository dietLogRepository, MealRepository mealRepository) {
        this.dietLogRepository = dietLogRepository;
        this.mealRepository = mealRepository;
    }

    @GetMapping
    public List<DietLog> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return dietLogRepository.findByUserIdAndDate(userId, date);
    }

    @PostMapping
    public DietLog create(@RequestBody DietLog dietLog, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        dietLog.setUserId(userId);
        if (dietLog.getMeal() != null && dietLog.getMeal().getId() != null) {
            Meal meal = mealRepository.findById(dietLog.getMeal().getId()).orElseThrow();
            dietLog.setMeal(meal);
            double servings = dietLog.getServings() > 0 ? dietLog.getServings() : 1.0;
            dietLog.setCalories((int) (meal.getCalories() * servings));
            dietLog.setProteinG(meal.getProteinG() * servings);
            dietLog.setCarbsG(meal.getCarbsG() * servings);
            dietLog.setFatG(meal.getFatG() * servings);
        }
        if (dietLog.getDate() == null) {
            dietLog.setDate(LocalDate.now());
        }
        return dietLogRepository.save(dietLog);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        dietLogRepository.deleteById(id);
    }
}
