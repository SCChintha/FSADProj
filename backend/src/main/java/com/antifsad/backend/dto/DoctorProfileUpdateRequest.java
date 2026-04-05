package com.antifsad.backend.dto;

import com.antifsad.backend.model.DocumentViewType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DoctorProfileUpdateRequest {
    private String firstName;
    private String lastName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
    private String phone;

    private String specialization;
    private String qualification;

    @Min(value = 0, message = "Years of experience cannot be negative")
    @Max(value = 60, message = "Years of experience cannot exceed 60")
    private Integer yearsOfExperience;

    @DecimalMin(value = "0.0", message = "Consultation fee cannot be negative")
    private Double consultationFee;

    private String hospitalName;
    private String hospitalAddress;

    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;

    private String languagesSpoken; // comma-separated
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String licenseStatus;
    private String degreeCertificateUrl;
    private String degreeDocumentDriveLink;
    private DocumentViewType degreeDocumentViewType;
    private String licenseDocumentUrl;
    private String licenseDocumentDriveLink;
    private DocumentViewType licenseDocumentViewType;
    private LocalTime availabilityStartTime;
    private LocalTime availabilityEndTime;
    private String availabilityDays;

    @Min(value = 10, message = "Slot duration must be at least 10 minutes")
    @Max(value = 240, message = "Slot duration cannot exceed 240 minutes")
    private Integer slotDurationMinutes;

    private Boolean acceptingAppointments;
}
