package com.fitnesstracker.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_templates")
public class WorkoutTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutTemplateEntry> entries = new ArrayList<>();

    public WorkoutTemplate() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<WorkoutTemplateEntry> getEntries() { return entries; }
    public void setEntries(List<WorkoutTemplateEntry> entries) { this.entries = entries; }
}
