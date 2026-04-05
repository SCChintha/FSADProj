package com.antifsad.backend.web.dto.admin;

import com.antifsad.backend.model.ComplaintStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminComplaintUpdateRequest {
    private ComplaintStatus status;
    private String adminResponse;
    private Long assignedAdminId;
}
