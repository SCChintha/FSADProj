package com.antifsad.backend.web.dto.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminModerationRequest {
    private String status;
    private String reason;
}
