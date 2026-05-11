package com.fitnesstracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "body_weight")
public class BodyWeight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private double weightKg;

    public BodyWeight() {}

    public BodyWeight(LocalDate date, double weightKg) {
        this.date = date;
        this.weightKg = weightKg;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }
}
