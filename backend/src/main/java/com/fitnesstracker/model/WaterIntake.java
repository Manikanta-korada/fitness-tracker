package com.fitnesstracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "water_intake")
public class WaterIntake {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userId;

    private LocalDate date;
    private String type;
    private int amountMl;
    @Column(columnDefinition = "integer default 0")
    private Integer calories = 0;
    @Column(columnDefinition = "double precision default 0")
    private Double proteinG = 0.0;
    @Column(columnDefinition = "double precision default 0")
    private Double carbsG = 0.0;
    @Column(columnDefinition = "double precision default 0")
    private Double fatG = 0.0;

    public WaterIntake() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getAmountMl() { return amountMl; }
    public void setAmountMl(int amountMl) { this.amountMl = amountMl; }
    public int getCalories() { return calories != null ? calories : 0; }
    public void setCalories(int calories) { this.calories = calories; }
    public double getProteinG() { return proteinG != null ? proteinG : 0.0; }
    public void setProteinG(double proteinG) { this.proteinG = proteinG; }
    public double getCarbsG() { return carbsG != null ? carbsG : 0.0; }
    public void setCarbsG(double carbsG) { this.carbsG = carbsG; }
    public double getFatG() { return fatG != null ? fatG : 0.0; }
    public void setFatG(double fatG) { this.fatG = fatG; }
}
