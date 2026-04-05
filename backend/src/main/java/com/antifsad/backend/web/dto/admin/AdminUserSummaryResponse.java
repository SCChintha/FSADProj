package com.antifsad.backend.web.dto.admin;

import com.antifsad.backend.model.User;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class AdminUserSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String status;
    private Boolean approved;
    private String phone;
    private String address;
    private Instant createdAt;
    private Instant lastLoginAt;
    private String approvalState;

    public static AdminUserSummaryResponse from(User user) {
        String approvalState = "NOT_REQUIRED";
        if ("DOCTOR".equals(user.getRole().name()) || "PHARMACIST".equals(user.getRole().name())) {
            approvalState = Boolean.TRUE.equals(user.getIsApproved()) ? "APPROVED" : "PENDING";
        }

        return AdminUserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .approved(Boolean.TRUE.equals(user.getIsApproved()))
                .phone(user.getPhone())
                .address(user.getAddress())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .approvalState(approvalState)
                .build();
    }
}
