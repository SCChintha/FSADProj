package com.antifsad.backend.web.dto.admin;

import com.antifsad.backend.model.Complaint;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class AdminComplaintResponse {
    private Long id;
    private String category;
    private String subject;
    private String description;
    private String status;
    private String adminResponse;
    private Long createdByUserId;
    private String createdByUserName;
    private Long targetUserId;
    private String targetUserName;
    private Long relatedAppointmentId;
    private Long relatedPrescriptionId;
    private Long assignedAdminId;
    private String assignedAdminName;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;

    public static AdminComplaintResponse from(Complaint complaint) {
        return AdminComplaintResponse.builder()
                .id(complaint.getId())
                .category(complaint.getCategory())
                .subject(complaint.getSubject())
                .description(complaint.getDescription())
                .status(complaint.getStatus().name())
                .adminResponse(complaint.getAdminResponse())
                .createdByUserId(complaint.getCreatedByUser() != null ? complaint.getCreatedByUser().getId() : null)
                .createdByUserName(complaint.getCreatedByUser() != null ? complaint.getCreatedByUser().getName() : null)
                .targetUserId(complaint.getTargetUser() != null ? complaint.getTargetUser().getId() : null)
                .targetUserName(complaint.getTargetUser() != null ? complaint.getTargetUser().getName() : null)
                .relatedAppointmentId(complaint.getRelatedAppointment() != null ? complaint.getRelatedAppointment().getId() : null)
                .relatedPrescriptionId(complaint.getRelatedPrescription() != null ? complaint.getRelatedPrescription().getId() : null)
                .assignedAdminId(complaint.getAssignedAdmin() != null ? complaint.getAssignedAdmin().getId() : null)
                .assignedAdminName(complaint.getAssignedAdmin() != null ? complaint.getAssignedAdmin().getName() : null)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .resolvedAt(complaint.getResolvedAt())
                .build();
    }
}
