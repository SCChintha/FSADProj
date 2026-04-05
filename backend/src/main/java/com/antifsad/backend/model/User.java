package com.antifsad.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "is_approved", nullable = false)
    @Builder.Default
    private Boolean isApproved = true;

    private String phone;

    private String address;

    private Instant createdAt;

    private Instant lastLoginAt;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"user"})
    private PatientProfile patientProfile;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"user"})
    private DoctorProfile doctorProfile;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"user"})
    private PharmacistProfile pharmacistProfile;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"user"})
    private AdminProfile adminProfile;

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<Appointment> patientAppointments = new ArrayList<>();

    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<Appointment> doctorAppointments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<Prescription> patientPrescriptions = new ArrayList<>();

    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<Prescription> doctorPrescriptions = new ArrayList<>();

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<MedicineOrder> patientOrders = new ArrayList<>();

    @OneToMany(mappedBy = "pharmacist", fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<MedicineOrder> pharmacistOrders = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
