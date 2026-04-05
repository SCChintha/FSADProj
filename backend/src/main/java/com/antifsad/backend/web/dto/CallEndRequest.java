package com.antifsad.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CallEndRequest {
    @NotBlank
    private String roomId;

    @NotNull
    private Long duration;
}
