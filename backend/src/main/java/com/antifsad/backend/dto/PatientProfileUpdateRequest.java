package com.antifsad.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientProfileUpdateRequest {
    private String firstName;
    private String lastName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
    private String phone;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private String gender;
    private String bloodGroup;

    @Min(value = 50, message = "Height must be at least 50 cm")
    @Max(value = 300, message = "Height cannot exceed 300 cm")
    private Double heightCm;

    @Min(value = 1, message = "Weight must be at least 1 kg")
    @Max(value = 500, message = "Weight cannot exceed 500 kg")
    private Double weightKg;

    private String allergies; // comma-separated
    private String chronicConditions;
    private String currentMedications;

    private String emergencyContactName;
    
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid emergency contact phone")
    private String emergencyContactPhone;
    
    private String emergencyContactRelation;

    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;

    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode")
    private String pincode;

    private String insuranceProvider;
    private String insurancePolicyNumber;
}