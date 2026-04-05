package com.antifsad.backend.web.dto.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminApprovalRequest {
    private Boolean approved;
    private String reason;
    private String verificationNotes;
}
