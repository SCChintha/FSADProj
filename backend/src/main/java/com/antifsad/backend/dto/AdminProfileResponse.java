package com.antifsad.backend.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class AdminProfileResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profilePhotoUrl;
    private String role;
    private Boolean isVerified;
    private Instant createdAt;

    private String employeeId;
    private String department;
    private String designation;

    private String accessLevel;
    private Boolean twoFactorEnabled;
    private Instant lastPasswordChange;
    private Instant lastLogin;

    private Long totalUsersManaged;
    private Long totalDoctorsPendingApproval;
}