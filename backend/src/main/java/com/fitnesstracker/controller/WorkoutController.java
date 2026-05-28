package com.fitnesstracker.controller;

import com.fitnesstracker.model.Exercise;
import com.fitnesstracker.model.ExerciseSet;
import com.fitnesstracker.model.WorkoutEntry;
import com.fitnesstracker.model.WorkoutSession;
import com.fitnesstracker.repository.ExerciseRepository;
import com.fitnesstracker.repository.WorkoutSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutSessionRepository sessionRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutController(WorkoutSessionRepository sessionRepository, ExerciseRepository exerciseRepository) {
        this.sessionRepository = sessionRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @GetMapping
    public List<WorkoutSession> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (date != null) {
            return sessionRepository.findByUserIdAndDate(userId, date);
        }
        if (from != null && to != null) {
            return sessionRepository.findByUserIdAndDateBetween(userId, from, to);
        }
        return sessionRepository.findByUserId(userId);
    }

    @GetMapping("/calendar")
    public List<Map<String, Object>> getCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<Object[]> counts = sessionRepository.countByUserIdAndDateBetween(userId, from, to);
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Object[] row : counts) {
            Map<String, Object> entry = new java.util.HashMap<>();
            entry.put("date", row[0]);
            entry.put("count", row[1]);
            result.add(entry);
        }
        return result;
    }

    @GetMapping("/{id}")
    public WorkoutSession getById(@PathVariable Long id) {
        return sessionRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public WorkoutSession create(@RequestBody WorkoutSession session, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        session.setUserId(userId);
        for (WorkoutEntry entry : session.getEntries()) {
            entry.setSession(session);
            if (entry.getExercise() != null && entry.getExercise().getId() != null) {
                Exercise exercise = exerciseRepository.findById(entry.getExercise().getId()).orElseThrow();
                entry.setExercise(exercise);
            }
            for (ExerciseSet set : entry.getSets()) {
                set.setEntry(entry);
            }
        }
        return sessionRepository.save(session);
    }

    @PutMapping("/{id}")
    public WorkoutSession update(@PathVariable Long id, @RequestBody WorkoutSession session, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        WorkoutSession existing = sessionRepository.findById(id).orElseThrow();
        existing.setName(session.getName());
        existing.setNotes(session.getNotes());
        existing.setUserId(userId);
        if (session.getDate() != null) {
            existing.setDate(session.getDate());
        }
        existing.getEntries().clear();
        for (WorkoutEntry entry : session.getEntries()) {
            entry.setSession(existing);
            if (entry.getExercise() != null && entry.getExercise().getId() != null) {
                Exercise exercise = exerciseRepository.findById(entry.getExercise().getId()).orElseThrow();
                entry.setExercise(exercise);
            }
            for (ExerciseSet set : entry.getSets()) {
                set.setEntry(entry);
            }
            existing.getEntries().add(entry);
        }
        return sessionRepository.save(existing);
    }

    @GetMapping("/last")
    public WorkoutSession getLast(@RequestParam String name, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        List<WorkoutSession> sessions = sessionRepository.findByUserId(userId);
        return sessions.stream()
                .filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(name))
                .max(java.util.Comparator.comparing(WorkoutSession::getDate))
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        sessionRepository.deleteById(id);
    }
}
