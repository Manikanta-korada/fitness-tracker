package com.fitnesstracker.controller;

import com.fitnesstracker.model.*;
import com.fitnesstracker.repository.BodyWeightRepository;
import com.fitnesstracker.repository.DietLogRepository;
import com.fitnesstracker.repository.WorkoutSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final BodyWeightRepository bodyWeightRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final DietLogRepository dietLogRepository;

    public ProgressController(BodyWeightRepository bodyWeightRepository,
                              WorkoutSessionRepository workoutSessionRepository,
                              DietLogRepository dietLogRepository) {
        this.bodyWeightRepository = bodyWeightRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.dietLogRepository = dietLogRepository;
    }

    @GetMapping("/weight")
    public List<BodyWeight> getWeightHistory(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return bodyWeightRepository.findByUserIdOrderByDateAsc(userId);
    }

    @PostMapping("/weight")
    public BodyWeight logWeight(@RequestBody BodyWeight bodyWeight, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        bodyWeight.setUserId(userId);
        if (bodyWeight.getDate() == null) {
            bodyWeight.setDate(LocalDate.now());
        }
        return bodyWeightRepository.save(bodyWeight);
    }

    @GetMapping("/exercise/{exerciseId}")
    public List<Map<String, Object>> getExerciseProgress(@PathVariable Long exerciseId, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserId(userId);
        List<Map<String, Object>> progress = new ArrayList<>();

        for (WorkoutSession session : sessions) {
            for (WorkoutEntry entry : session.getEntries()) {
                if (entry.getExercise() != null && entry.getExercise().getId().equals(exerciseId)) {
                    List<ExerciseSet> sets = entry.getSets();
                    if (sets.isEmpty()) continue;

                    Map<String, Object> point = new HashMap<>();
                    point.put("date", session.getDate());
                    point.put("weightKg", sets.stream()
                            .mapToDouble(ExerciseSet::getWeightKg)
                            .max().orElse(0));
                    point.put("totalSets", sets.size());
                    point.put("totalVolume", sets.stream()
                            .mapToDouble(s -> s.getWeightKg() * s.getReps())
                            .sum());
                    progress.add(point);
                }
            }
        }

        progress.sort(Comparator.comparing(m -> (LocalDate) m.get("date")));
        return progress;
    }

    @GetMapping("/calories")
    public List<Map<String, Object>> getCalorieTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<DietLog> logs = dietLogRepository.findByUserIdAndDateBetween(userId, from, to);

        Map<LocalDate, Integer> dailyCalories = logs.stream()
                .collect(Collectors.groupingBy(DietLog::getDate, Collectors.summingInt(DietLog::getCalories)));

        return dailyCalories.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("date", e.getKey());
                    point.put("calories", e.getValue());
                    return point;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/macros")
    public List<Map<String, Object>> getMacroTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<DietLog> logs = dietLogRepository.findByUserIdAndDateBetween(userId, from, to);

        Map<LocalDate, List<DietLog>> byDate = logs.stream()
                .collect(Collectors.groupingBy(DietLog::getDate));

        return byDate.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("date", e.getKey());
                    point.put("calories", e.getValue().stream().mapToInt(DietLog::getCalories).sum());
                    point.put("protein", e.getValue().stream().mapToDouble(DietLog::getProteinG).sum());
                    point.put("carbs", e.getValue().stream().mapToDouble(DietLog::getCarbsG).sum());
                    point.put("fat", e.getValue().stream().mapToDouble(DietLog::getFatG).sum());
                    return point;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/meal-breakdown")
    public List<Map<String, Object>> getMealTypeBreakdown(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<DietLog> logs = dietLogRepository.findByUserIdAndDateBetween(userId, from, to);

        Map<String, Integer> byType = new LinkedHashMap<>();
        for (String type : List.of("Breakfast", "Pre-Workout", "Lunch", "Snacks", "Post-Workout", "Dinner")) {
            byType.put(type, 0);
        }
        for (DietLog log : logs) {
            String type = log.getMealType() != null ? log.getMealType() : "Other";
            byType.merge(type, log.getCalories(), Integer::sum);
        }

        return byType.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .map(e -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("mealType", e.getKey());
                    point.put("calories", e.getValue());
                    return point;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/workout-frequency")
    public List<Map<String, Object>> getWorkoutFrequency(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserIdAndDateBetween(userId, from, to);

        Map<String, Long> weeklyCount = new TreeMap<>();
        for (WorkoutSession session : sessions) {
            LocalDate date = session.getDate();
            LocalDate weekStart = date.minusDays(date.getDayOfWeek().getValue() - 1);
            String weekLabel = weekStart.toString();
            weeklyCount.merge(weekLabel, 1L, Long::sum);
        }

        return weeklyCount.entrySet().stream()
                .map(e -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("week", e.getKey());
                    point.put("workouts", e.getValue());
                    return point;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/muscle-volume")
    public List<Map<String, Object>> getMuscleVolume(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserIdAndDateBetween(userId, from, to);

        Map<String, Double> volumeByGroup = new TreeMap<>();
        for (WorkoutSession session : sessions) {
            for (WorkoutEntry entry : session.getEntries()) {
                if (entry.getExercise() == null) continue;
                String group = entry.getExercise().getMuscleGroup();
                double volume = entry.getSets().stream()
                        .mapToDouble(s -> s.getWeightKg() * s.getReps())
                        .sum();
                volumeByGroup.merge(group, volume, Double::sum);
            }
        }

        return volumeByGroup.entrySet().stream()
                .map(e -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("muscleGroup", e.getKey());
                    point.put("volume", Math.round(e.getValue()));
                    return point;
                })
                .collect(Collectors.toList());
    }
}
