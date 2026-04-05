package com.antifsad.backend.web.dto.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminComplaintCreateRequest {
    private Long createdByUserId;
    private Long targetUserId;
    private Long relatedAppointmentId;
    private Long relatedPrescriptionId;
    private String category;
    private String subject;
    private String description;
}
