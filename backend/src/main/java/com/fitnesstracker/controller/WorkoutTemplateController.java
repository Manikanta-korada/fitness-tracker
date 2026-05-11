package com.fitnesstracker.controller;

import com.fitnesstracker.model.*;
import com.fitnesstracker.repository.ExerciseRepository;
import com.fitnesstracker.repository.WorkoutSessionRepository;
import com.fitnesstracker.repository.WorkoutTemplateRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workout-templates")
public class WorkoutTemplateController {

    private final WorkoutTemplateRepository templateRepository;
    private final WorkoutSessionRepository sessionRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutTemplateController(WorkoutTemplateRepository templateRepository,
                                     WorkoutSessionRepository sessionRepository,
                                     ExerciseRepository exerciseRepository) {
        this.templateRepository = templateRepository;
        this.sessionRepository = sessionRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @GetMapping
    public List<WorkoutTemplate> getAll() {
        return templateRepository.findAll();
    }

    @PostMapping
    public WorkoutTemplate create(@RequestBody WorkoutTemplate template) {
        for (WorkoutTemplateEntry entry : template.getEntries()) {
            entry.setTemplate(template);
            if (entry.getExercise() != null && entry.getExercise().getId() != null) {
                Exercise exercise = exerciseRepository.findById(entry.getExercise().getId()).orElseThrow();
                entry.setExercise(exercise);
            }
            for (TemplateExerciseSet set : entry.getSets()) {
                set.setTemplateEntry(entry);
            }
        }
        return templateRepository.save(template);
    }

    @PostMapping("/{id}/apply")
    public WorkoutSession applyTemplate(@PathVariable Long id) {
        WorkoutTemplate template = templateRepository.findById(id).orElseThrow();
        WorkoutSession session = new WorkoutSession();
        session.setDate(LocalDate.now());
        session.setName(template.getName());

        for (WorkoutTemplateEntry te : template.getEntries()) {
            WorkoutEntry entry = new WorkoutEntry();
            entry.setSession(session);
            entry.setExercise(te.getExercise());

            for (TemplateExerciseSet templateSet : te.getSets()) {
                ExerciseSet exerciseSet = new ExerciseSet();
                exerciseSet.setEntry(entry);
                exerciseSet.setSetNumber(templateSet.getSetNumber());
                exerciseSet.setReps(templateSet.getReps());
                exerciseSet.setWeightKg(templateSet.getWeightKg());
                entry.getSets().add(exerciseSet);
            }
            session.getEntries().add(entry);
        }

        return sessionRepository.save(session);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        templateRepository.deleteById(id);
    }
}
