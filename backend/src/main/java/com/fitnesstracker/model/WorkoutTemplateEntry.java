package com.fitnesstracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_template_entries")
public class WorkoutTemplateEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "template_id")
    @JsonIgnore
    private WorkoutTemplate template;

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @OneToMany(mappedBy = "templateEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TemplateExerciseSet> sets = new ArrayList<>();

    public WorkoutTemplateEntry() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public WorkoutTemplate getTemplate() { return template; }
    public void setTemplate(WorkoutTemplate template) { this.template = template; }
    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }
    public List<TemplateExerciseSet> getSets() { return sets; }
    public void setSets(List<TemplateExerciseSet> sets) { this.sets = sets; }
}
