package com.antifsad.backend.dto;

import lombok.Data;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
public class PatientProfileResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profilePhotoUrl;
    private String role;
    private Boolean isVerified;
    private Instant createdAt;

    private LocalDate dateOfBirth;
    private Integer age;
    private String gender;
    private String bloodGroup;

    private Double heightCm;
    private Double weightKg;
    private Double bmi;
    private String bmiCategory;

    private List<String> allergiesList;
    private List<String> chronicConditionsList;
    private List<String> currentMedicationsList;

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

    private Integer profileCompletionPercent;
    private List<String> missingFields;
}