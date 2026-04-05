package com.antifsad.backend.dto;

import com.antifsad.backend.model.DocumentViewType;
import lombok.Data;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class DoctorProfileResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profilePhotoUrl;
    private String role;
    private Boolean isVerified;
    private Boolean isApproved;
    private Instant createdAt;

    private String specialization;
    private String specializationLabel; // Formatted specialization
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String licenseStatus; // VALID, EXPIRING_SOON, EXPIRED

    private String qualification;
    private Integer yearsOfExperience;
    
    private String hospitalName;
    private String hospitalAddress;
    private Double consultationFee;
    
    private String bio;
    
    private List<String> languagesSpokenList;
    
    private Double averageRating;
    private Integer totalReviews;
    private Integer totalConsultations;

    private DocumentViewType degreeDocumentViewType;
    private String degreeCertificateUrl;
    private String degreeDocumentDriveLink;
    private DocumentViewType licenseDocumentViewType;
    private String licenseDocumentUrl;
    private String licenseDocumentDriveLink;
    private LocalTime availabilityStartTime;
    private LocalTime availabilityEndTime;
    private List<String> availabilityDaysList;
    private Integer slotDurationMinutes;
    private Boolean acceptingAppointments;

    private Integer profileCompletionPercent;
    private List<String> missingFields;
}
