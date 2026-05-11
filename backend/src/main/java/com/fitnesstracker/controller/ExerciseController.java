package com.fitnesstracker.controller;

import com.fitnesstracker.model.Exercise;
import com.fitnesstracker.repository.ExerciseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;

    public ExerciseController(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @GetMapping
    public List<Exercise> getAll() {
        return exerciseRepository.findAll();
    }

    @PostMapping
    public Exercise create(@RequestBody Exercise exercise) {
        exercise.setCustom(true);
        return exerciseRepository.save(exercise);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        exerciseRepository.deleteById(id);
    }
}
