package com.antifsad.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "doctor_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_doctor_profile_user"))
    private User user;

    private String firstName;
    private String lastName;
    private String phone;

    private String specialization;
    private String qualification;
    private Integer yearsOfExperience;
    private Double consultationFee;

    private String hospitalName;
    private String hospitalAddress;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String languagesSpoken; // comma-separated

    private String licenseNumber;
    private java.time.LocalDate licenseExpiryDate;
    private String licenseStatus; // VALID, EXPIRING_SOON, EXPIRED

    @Enumerated(EnumType.STRING)
    private DocumentViewType degreeDocumentViewType;
    private String degreeCertificateUrl;
    private String degreeDocumentDriveLink;

    @Enumerated(EnumType.STRING)
    private DocumentViewType licenseDocumentViewType;
    private String licenseDocumentUrl;
    private String licenseDocumentDriveLink;

    private java.time.LocalTime availabilityStartTime;
    private java.time.LocalTime availabilityEndTime;
    private String availabilityDays; // comma-separated
    private Integer slotDurationMinutes;

    @Builder.Default
    private Boolean acceptingAppointments = Boolean.TRUE;

    private Double averageRating;
    private Integer totalReviews;
    private Integer totalConsultations;

}
