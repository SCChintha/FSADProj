package com.antifsad.backend.dto;

import com.antifsad.backend.model.DocumentViewType;
import lombok.Data;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class PharmacistProfileResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profilePhotoUrl;
    private String role;
    private Boolean isVerified;
    private Instant createdAt;

    private String pharmacyName;
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String licenseStatus;

    private String qualification;
    private Integer yearsOfExperience;

    private String pharmacyAddressLine1;
    private String pharmacyAddressLine2;
    private String pharmacyCity;
    private String pharmacyState;
    private String pharmacyPincode;
    private String pharmacyPhone;

    private LocalTime workingHoursStart;
    private LocalTime workingHoursEnd;
    private List<String> workingDaysList;

    private DocumentViewType licenseDocumentViewType;
    private String licenseDocumentUrl;
    private String licenseDocumentDriveLink;

    private Integer profileCompletionPercent;
    private List<String> missingFields;
}
