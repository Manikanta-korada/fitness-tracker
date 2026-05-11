package com.fitnesstracker.controller;

import com.fitnesstracker.model.DailyTarget;
import com.fitnesstracker.repository.DailyTargetRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/targets")
public class TargetController {

    private final DailyTargetRepository targetRepository;

    public TargetController(DailyTargetRepository targetRepository) {
        this.targetRepository = targetRepository;
    }

    @GetMapping
    public DailyTarget getTargets() {
        return targetRepository.findAll().stream().findFirst().orElse(new DailyTarget());
    }

    @PutMapping
    public DailyTarget updateTargets(@RequestBody DailyTarget target) {
        DailyTarget existing = targetRepository.findAll().stream().findFirst().orElse(null);
        if (existing != null) {
            target.setId(existing.getId());
        }
        return targetRepository.save(target);
    }
}
