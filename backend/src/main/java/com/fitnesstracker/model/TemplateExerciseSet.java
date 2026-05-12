package com.fitnesstracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "template_exercise_sets")
public class TemplateExerciseSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "template_entry_id")
    @JsonIgnore
    private WorkoutTemplateEntry templateEntry;

    private int setNumber;
    private int reps;
    private double weightKg;
    private Double durationMinutes;
    private Double distanceKm;

    public TemplateExerciseSet() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public WorkoutTemplateEntry getTemplateEntry() { return templateEntry; }
    public void setTemplateEntry(WorkoutTemplateEntry templateEntry) { this.templateEntry = templateEntry; }
    public int getSetNumber() { return setNumber; }
    public void setSetNumber(int setNumber) { this.setNumber = setNumber; }
    public int getReps() { return reps; }
    public void setReps(int reps) { this.reps = reps; }
    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }
    public Double getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Double durationMinutes) { this.durationMinutes = durationMinutes; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
}
