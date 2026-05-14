package com.fitnesstracker.controller;

import com.fitnesstracker.model.WaterIntake;
import com.fitnesstracker.repository.WaterIntakeRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/water")
public class WaterController {

    private final WaterIntakeRepository repository;

    public WaterController(WaterIntakeRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<WaterIntake> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return repository.findByUserIdAndDate(userId, date);
    }

    @PostMapping
    public WaterIntake create(@RequestBody WaterIntake intake, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        intake.setUserId(userId);
        if (intake.getDate() == null) {
            intake.setDate(LocalDate.now());
        }
        if ("Coconut Water".equals(intake.getType())) {
            double factor = intake.getAmountMl() / 100.0;
            intake.setCalories((int) Math.round(19 * factor));
            intake.setProteinG(Math.round(0.7 * factor * 10.0) / 10.0);
            intake.setCarbsG(Math.round(3.7 * factor * 10.0) / 10.0);
            intake.setFatG(Math.round(0.2 * factor * 10.0) / 10.0);
        }
        return repository.save(intake);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @GetMapping("/trend")
    public List<Map<String, Object>> getTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<WaterIntake> logs = repository.findByUserIdAndDateBetween(userId, from, to);

        Map<LocalDate, Map<String, Integer>> daily = new TreeMap<>();
        for (WaterIntake log : logs) {
            daily.computeIfAbsent(log.getDate(), k -> new HashMap<>())
                 .merge(log.getType(), log.getAmountMl(), Integer::sum);
        }

        return daily.entrySet().stream()
                .map(e -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("date", e.getKey());
                    point.put("water", e.getValue().getOrDefault("Water", 0));
                    point.put("coconutWater", e.getValue().getOrDefault("Coconut Water", 0));
                    point.put("total", e.getValue().values().stream().mapToInt(Integer::intValue).sum());
                    return point;
                })
                .collect(Collectors.toList());
    }
}
