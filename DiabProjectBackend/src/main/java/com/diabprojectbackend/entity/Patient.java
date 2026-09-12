package com.diabprojectbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int age;

    // Yahan default value add kar di taaki purane data se clash na ho
    @Column(columnDefinition = "boolean default false")
    private boolean hasHistoryOfDiabetes;

    // The path where the uploaded image is stored locally or on cloud
    private String fundusImagePath;

    // AI results from the Python service
    private Integer drSeverityLevel;
    private String aiHeatmapPath;

    private LocalDateTime screeningDate;
    private String doctorRemarks;

    @PrePersist
    protected void onCreate() {
        this.screeningDate = LocalDateTime.now();
    }
}