package com.fitnesstracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "daily_targets")
public class DailyTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int calorieTarget;
    private double proteinTargetG;
    private double carbsTargetG;
    private double fatTargetG;

    public DailyTarget() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getCalorieTarget() { return calorieTarget; }
    public void setCalorieTarget(int calorieTarget) { this.calorieTarget = calorieTarget; }
    public double getProteinTargetG() { return proteinTargetG; }
    public void setProteinTargetG(double proteinTargetG) { this.proteinTargetG = proteinTargetG; }
    public double getCarbsTargetG() { return carbsTargetG; }
    public void setCarbsTargetG(double carbsTargetG) { this.carbsTargetG = carbsTargetG; }
    public double getFatTargetG() { return fatTargetG; }
    public void setFatTargetG(double fatTargetG) { this.fatTargetG = fatTargetG; }
}
