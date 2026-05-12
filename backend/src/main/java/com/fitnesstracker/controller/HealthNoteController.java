package com.fitnesstracker.controller;

import com.fitnesstracker.model.HealthNote;
import com.fitnesstracker.repository.HealthNoteRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/health-notes")
public class HealthNoteController {

    private final HealthNoteRepository healthNoteRepository;

    public HealthNoteController(HealthNoteRepository healthNoteRepository) {
        this.healthNoteRepository = healthNoteRepository;
    }

    @GetMapping
    public List<HealthNote> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return healthNoteRepository.findByUserIdAndDate(userId, date);
    }

    @PostMapping
    public HealthNote create(@RequestBody HealthNote healthNote, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        healthNote.setUserId(userId);
        if (healthNote.getDate() == null) {
            healthNote.setDate(LocalDate.now());
        }
        if (healthNote.getSeverity() == null) {
            healthNote.setSeverity("info");
        }
        return healthNoteRepository.save(healthNote);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        healthNoteRepository.deleteById(id);
    }

    @GetMapping("/trend")
    public List<HealthNote> getTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return healthNoteRepository.findByUserIdAndDateBetween(userId, from, to);
    }
}
