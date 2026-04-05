package com.antifsad.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "pharmacist_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacistProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_pharmacist_profile_user"))
    private User user;

    private String firstName;
    private String lastName;
    private String phone;

    private String pharmacyName;
    private String pharmacyAddressLine1;
    private String pharmacyAddressLine2;
    private String pharmacyCity;
    private String pharmacyState;
    private String pharmacyPincode;
    private String pharmacyPhone;

    private LocalTime workingHoursStart;
    private LocalTime workingHoursEnd;
    
    private String workingDays; // comma-separated

    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String licenseStatus;

    @Enumerated(EnumType.STRING)
    private DocumentViewType licenseDocumentViewType;

    private String qualification;
    private Integer yearsOfExperience;
    
    private String licenseDocumentUrl;
    private String licenseDocumentDriveLink;

}
