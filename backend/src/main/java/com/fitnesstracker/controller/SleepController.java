package com.fitnesstracker.controller;

import com.fitnesstracker.model.SleepLog;
import com.fitnesstracker.repository.SleepLogRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sleep")
public class SleepController {

    private final SleepLogRepository repository;

    public SleepController(SleepLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<SleepLog> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return repository.findByDate(date);
    }

    @PostMapping
    public SleepLog create(@RequestBody SleepLog sleepLog) {
        if (sleepLog.getDate() == null) {
            sleepLog.setDate(LocalDate.now());
        }
        int duration = calculateDuration(sleepLog.getBedtime(), sleepLog.getWakeTime());
        sleepLog.setDurationMinutes(duration);
        return repository.save(sleepLog);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @GetMapping("/trend")
    public List<Map<String, Object>> getTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<SleepLog> logs = repository.findByDateBetween(from, to);

        return logs.stream()
                .sorted(Comparator.comparing(SleepLog::getDate))
                .map(log -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("date", log.getDate());
                    point.put("durationHours", Math.round(log.getDurationMinutes() / 6.0) / 10.0);
                    point.put("durationMinutes", log.getDurationMinutes());
                    return point;
                })
                .collect(Collectors.toList());
    }

    private int calculateDuration(String bedtime, String wakeTime) {
        LocalTime bed = LocalTime.parse(bedtime);
        LocalTime wake = LocalTime.parse(wakeTime);
        long minutes = ChronoUnit.MINUTES.between(bed, wake);
        if (minutes <= 0) {
            minutes += 24 * 60;
        }
        return (int) minutes;
    }
}
