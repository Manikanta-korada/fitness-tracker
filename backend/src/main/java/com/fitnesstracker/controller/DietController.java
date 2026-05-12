package com.fitnesstracker.controller;

import com.fitnesstracker.model.DietLog;
import com.fitnesstracker.model.Meal;
import com.fitnesstracker.repository.DietLogRepository;
import com.fitnesstracker.repository.MealRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

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

    @PostMapping("/copy")
    public List<DietLog> copyDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<DietLog> sourceLogs = dietLogRepository.findByUserIdAndDate(userId, from);
        List<DietLog> copied = new ArrayList<>();
        for (DietLog source : sourceLogs) {
            DietLog copy = new DietLog();
            copy.setUserId(userId);
            copy.setDate(to);
            copy.setMeal(source.getMeal());
            copy.setCustomName(source.getCustomName());
            copy.setMealType(source.getMealType());
            copy.setCalories(source.getCalories());
            copy.setProteinG(source.getProteinG());
            copy.setCarbsG(source.getCarbsG());
            copy.setFatG(source.getFatG());
            copy.setServings(source.getServings());
            copied.add(dietLogRepository.save(copy));
        }
        return copied;
    }

    @GetMapping("/recent")
    public List<Map<String, Object>> getRecent(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        LocalDate today = LocalDate.now();
        List<DietLog> recentLogs = dietLogRepository.findByUserIdAndDateBetween(userId, today.minusDays(7), today);

        Map<String, Map<String, Object>> seen = new LinkedHashMap<>();
        for (DietLog log : recentLogs) {
            String key = log.getMeal() != null ? "meal_" + log.getMeal().getId() : "custom_" + log.getCustomName();
            if (!seen.containsKey(key)) {
                Map<String, Object> entry = new HashMap<>();
                if (log.getMeal() != null) {
                    entry.put("mealId", log.getMeal().getId());
                    entry.put("name", log.getMeal().getName());
                    entry.put("calories", log.getMeal().getCalories());
                    entry.put("proteinG", log.getMeal().getProteinG());
                } else {
                    entry.put("name", log.getCustomName());
                    entry.put("calories", log.getCalories());
                    entry.put("proteinG", log.getProteinG());
                }
                seen.put(key, entry);
            }
        }
        return new ArrayList<>(seen.values());
    }
}
