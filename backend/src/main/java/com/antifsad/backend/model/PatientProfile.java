package com.antifsad.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "patient_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_patient_profile_user"))
    private User user;

    private String firstName;
    private String lastName;
    private String phone;
    
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    
    private Double heightCm;
    private Double weightKg;

    @Column(columnDefinition = "TEXT")
    private String allergies; // comma-separated

    @Column(columnDefinition = "TEXT")
    private String chronicConditions;

    @Column(columnDefinition = "TEXT")
    private String currentMedications;

    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;

    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;

    private String insuranceProvider;
    private String insurancePolicyNumber;

}
