package com.antifsad.backend.dto;

import com.antifsad.backend.model.DocumentViewType;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PharmacistProfileUpdateRequest {
    private String firstName;
    private String lastName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
    private String phone;

    private String pharmacyName;
    private String pharmacyAddressLine1;
    private String pharmacyAddressLine2;
    private String pharmacyCity;
    private String pharmacyState;
    
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode")
    private String pharmacyPincode;
    
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid pharmacy phone number")
    private String pharmacyPhone;

    private LocalTime workingHoursStart;
    private LocalTime workingHoursEnd;
    
    private String workingDays; // comma-separated
    
    private String qualification;
    private Integer yearsOfExperience;
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String licenseStatus;
    private String licenseDocumentUrl;
    private String licenseDocumentDriveLink;
    private DocumentViewType licenseDocumentViewType;
}
