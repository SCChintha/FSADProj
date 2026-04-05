package com.antifsad.backend.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CallInitiateRequest {
    @NotNull
    private Long appointmentId;

    @NotNull
    private Long receiverId;
}
