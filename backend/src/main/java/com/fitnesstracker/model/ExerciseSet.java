package com.fitnesstracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "exercise_sets")
public class ExerciseSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "entry_id")
    @JsonIgnore
    private WorkoutEntry entry;

    private int setNumber;
    private int reps;
    private double weightKg;

    public ExerciseSet() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public WorkoutEntry getEntry() { return entry; }
    public void setEntry(WorkoutEntry entry) { this.entry = entry; }
    public int getSetNumber() { return setNumber; }
    public void setSetNumber(int setNumber) { this.setNumber = setNumber; }
    public int getReps() { return reps; }
    public void setReps(int reps) { this.reps = reps; }
    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }
}
