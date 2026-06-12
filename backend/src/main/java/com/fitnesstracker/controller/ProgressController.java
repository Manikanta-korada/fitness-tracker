package com.fitnesstracker.controller;

import com.fitnesstracker.model.*;
import com.fitnesstracker.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
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
    private final DailyTargetRepository dailyTargetRepository;
    private final MealRepository mealRepository;
    private final SleepLogRepository sleepLogRepository;
    private final WaterIntakeRepository waterIntakeRepository;

    public ProgressController(BodyWeightRepository bodyWeightRepository,
                              WorkoutSessionRepository workoutSessionRepository,
                              DietLogRepository dietLogRepository,
                              DailyTargetRepository dailyTargetRepository,
                              MealRepository mealRepository,
                              SleepLogRepository sleepLogRepository,
                              WaterIntakeRepository waterIntakeRepository) {
        this.bodyWeightRepository = bodyWeightRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.dietLogRepository = dietLogRepository;
        this.dailyTargetRepository = dailyTargetRepository;
        this.mealRepository = mealRepository;
        this.sleepLogRepository = sleepLogRepository;
        this.waterIntakeRepository = waterIntakeRepository;
    }

    @GetMapping("/weight")
    public List<BodyWeight> getWeightHistory(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return bodyWeightRepository.findByUserIdOrderByDateAsc(userId);
    }

    @PostMapping("/weight")
    public BodyWeight logWeight(@RequestBody BodyWeight bodyWeight, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        LocalDate date = bodyWeight.getDate() != null ? bodyWeight.getDate() : LocalDate.now();
        BodyWeight existing = bodyWeightRepository.findByUserIdAndDate(userId, date).orElse(null);
        if (existing != null) {
            existing.setWeightKg(bodyWeight.getWeightKg());
            return bodyWeightRepository.save(existing);
        }
        bodyWeight.setUserId(userId);
        bodyWeight.setDate(date);
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
        for (String type : List.of("Pre-Workout", "Post-Workout", "Breakfast", "Lunch", "Snacks", "Dinner", "Miscellaneous")) {
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

    @GetMapping("/muscle-sets")
    public List<Map<String, Object>> getMuscleSets(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserIdAndDateBetween(userId, from, to);

        Map<String, Integer> setsByGroup = new TreeMap<>();
        for (WorkoutSession session : sessions) {
            for (WorkoutEntry entry : session.getEntries()) {
                if (entry.getExercise() == null) continue;
                String group = entry.getExercise().getMuscleGroup();
                setsByGroup.merge(group, entry.getSets().size(), Integer::sum);
            }
        }

        return setsByGroup.entrySet().stream()
                .map(e -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("muscleGroup", e.getKey());
                    point.put("sets", e.getValue());
                    return point;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/recommendations/meals")
    public List<Map<String, Object>> getMealRecommendations(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<DailyTarget> targets = dailyTargetRepository.findAll();
        if (targets.isEmpty()) return List.of();
        DailyTarget target = targets.get(0);

        List<DietLog> todayLogs = dietLogRepository.findByUserIdAndDate(userId, LocalDate.now());
        int consumedCalories = todayLogs.stream().mapToInt(DietLog::getCalories).sum();
        double consumedProtein = todayLogs.stream().mapToDouble(DietLog::getProteinG).sum();
        double consumedCarbs = todayLogs.stream().mapToDouble(DietLog::getCarbsG).sum();
        double consumedFat = todayLogs.stream().mapToDouble(DietLog::getFatG).sum();

        int remainingCalories = target.getCalorieTarget() - consumedCalories;
        double remainingProtein = target.getProteinTargetG() - consumedProtein;
        double remainingCarbs = target.getCarbsTargetG() - consumedCarbs;
        double remainingFat = target.getFatTargetG() - consumedFat;

        List<Meal> meals = mealRepository.findAll();
        return meals.stream()
                .filter(m -> m.getCalories() <= Math.max(remainingCalories, 0))
                .sorted((a, b) -> Double.compare(b.getProteinG(), a.getProteinG()))
                .limit(5)
                .map(m -> {
                    Map<String, Object> rec = new HashMap<>();
                    rec.put("id", m.getId());
                    rec.put("name", m.getName());
                    rec.put("calories", m.getCalories());
                    rec.put("proteinG", m.getProteinG());
                    rec.put("carbsG", m.getCarbsG());
                    rec.put("fatG", m.getFatG());
                    if (remainingProtein > 0) {
                        rec.put("reason", String.format("You need %.0fg more protein", remainingProtein));
                    } else if (remainingCalories > 0) {
                        rec.put("reason", String.format("You have %d kcal remaining", remainingCalories));
                    } else {
                        rec.put("reason", "Fits your remaining budget");
                    }
                    return rec;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/recommendations/muscle-group")
    public Map<String, Object> getMuscleGroupRecommendation(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        LocalDate today = LocalDate.now();
        List<WorkoutSession> recentSessions = workoutSessionRepository.findByUserIdAndDateBetween(userId, today.minusDays(7), today);

        List<String> allGroups = List.of("Chest", "Back", "Shoulders", "Legs", "Biceps", "Triceps", "Core", "Cardio");
        Map<String, LocalDate> lastTrained = new HashMap<>();
        for (String group : allGroups) {
            lastTrained.put(group, null);
        }

        for (WorkoutSession session : recentSessions) {
            for (WorkoutEntry entry : session.getEntries()) {
                if (entry.getExercise() != null) {
                    String group = entry.getExercise().getMuscleGroup();
                    if (lastTrained.containsKey(group)) {
                        LocalDate current = lastTrained.get(group);
                        if (current == null || session.getDate().isAfter(current)) {
                            lastTrained.put(group, session.getDate());
                        }
                    }
                }
            }
        }

        String leastRecent = null;
        long maxDays = -1;
        for (Map.Entry<String, LocalDate> e : lastTrained.entrySet()) {
            long days = e.getValue() == null ? 8 : java.time.temporal.ChronoUnit.DAYS.between(e.getValue(), today);
            if (days > maxDays) {
                maxDays = days;
                leastRecent = e.getKey();
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("muscleGroup", leastRecent);
        result.put("daysSinceLastTrained", maxDays > 7 ? "7+" : maxDays);
        return result;
    }

    @GetMapping("/weekly-streak")
    public Map<String, Object> getWeeklyStreak(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        LocalDate today = LocalDate.now();
        LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1);
        List<WorkoutSession> weekSessions = workoutSessionRepository.findByUserIdAndDateBetween(userId, monday, today);

        long daysLogged = weekSessions.stream()
                .map(WorkoutSession::getDate)
                .distinct()
                .count();

        Map<String, Object> result = new HashMap<>();
        result.put("daysLogged", daysLogged);
        result.put("totalDays", 7);
        result.put("weekStart", monday);
        return result;
    }

    @GetMapping("/weekly-summary")
    public Map<String, Object> getWeeklySummary(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        LocalDate today = LocalDate.now();
        LocalDate thisWeekStart = today.with(DayOfWeek.MONDAY);
        LocalDate lastWeekStart = thisWeekStart.minusDays(7);
        LocalDate lastWeekEnd = thisWeekStart.minusDays(1);

        Map<String, Object> thisWeek = computeWeekStats(userId, thisWeekStart, today);
        Map<String, Object> lastWeek = computeWeekStats(userId, lastWeekStart, lastWeekEnd);

        Map<String, Object> result = new HashMap<>();
        result.put("thisWeek", thisWeek);
        result.put("lastWeek", lastWeek);
        return result;
    }

    private Map<String, Object> computeWeekStats(String userId, LocalDate from, LocalDate to) {
        List<DietLog> dietLogs = dietLogRepository.findByUserIdAndDateBetween(userId, from, to);
        List<WorkoutSession> workouts = workoutSessionRepository.findByUserIdAndDateBetween(userId, from, to);
        List<SleepLog> sleepLogs = sleepLogRepository.findByUserIdAndDateBetween(userId, from, to);
        List<WaterIntake> waterLogs = waterIntakeRepository.findByUserIdAndDateBetween(userId, from, to);
        List<BodyWeight> weights = bodyWeightRepository.findByUserIdAndDateBetweenOrderByDateAsc(userId, from, to);

        long daysWithMeals = dietLogs.stream().map(DietLog::getDate).distinct().count();
        int totalCalories = dietLogs.stream().mapToInt(DietLog::getCalories).sum();
        double totalProtein = dietLogs.stream().mapToDouble(DietLog::getProteinG).sum();

        long workoutCount = workouts.stream().map(WorkoutSession::getDate).distinct().count();

        double avgSleepHours = sleepLogs.isEmpty() ? 0 :
                sleepLogs.stream().mapToInt(SleepLog::getDurationMinutes).average().orElse(0) / 60.0;

        int totalWaterMl = waterLogs.stream().mapToInt(WaterIntake::getAmountMl).sum();
        long daysWithWater = waterLogs.stream().map(WaterIntake::getDate).distinct().count();

        Double startWeight = weights.isEmpty() ? null : weights.get(0).getWeightKg();
        Double endWeight = weights.isEmpty() ? null : weights.get(weights.size() - 1).getWeightKg();

        Map<String, Object> stats = new HashMap<>();
        stats.put("avgCalories", daysWithMeals > 0 ? Math.round((double) totalCalories / daysWithMeals) : 0);
        stats.put("avgProtein", daysWithMeals > 0 ? Math.round(totalProtein / daysWithMeals * 10.0) / 10.0 : 0);
        stats.put("workoutDays", workoutCount);
        stats.put("avgSleepHours", Math.round(avgSleepHours * 10.0) / 10.0);
        stats.put("avgWaterMl", daysWithWater > 0 ? Math.round((double) totalWaterMl / daysWithWater) : 0);
        stats.put("startWeight", startWeight);
        stats.put("endWeight", endWeight);
        return stats;
    }

    @GetMapping("/personal-records")
    public List<Map<String, Object>> getPersonalRecords(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserId(userId);

        Map<Long, Map<String, Object>> prs = new HashMap<>();
        for (WorkoutSession session : sessions) {
            for (WorkoutEntry entry : session.getEntries()) {
                if (entry.getExercise() == null) continue;
                Long exId = entry.getExercise().getId();
                for (ExerciseSet set : entry.getSets()) {
                    Map<String, Object> current = prs.get(exId);
                    if (current == null || set.getWeightKg() > (double) current.get("maxWeightKg")) {
                        Map<String, Object> pr = new HashMap<>();
                        pr.put("exerciseId", exId);
                        pr.put("exerciseName", entry.getExercise().getName());
                        pr.put("muscleGroup", entry.getExercise().getMuscleGroup());
                        pr.put("maxWeightKg", set.getWeightKg());
                        pr.put("date", session.getDate());
                        prs.put(exId, pr);
                    }
                }
            }
        }

        return prs.values().stream()
                .sorted((a, b) -> ((String) a.get("muscleGroup")).compareTo((String) b.get("muscleGroup")))
                .collect(Collectors.toList());
    }
}
