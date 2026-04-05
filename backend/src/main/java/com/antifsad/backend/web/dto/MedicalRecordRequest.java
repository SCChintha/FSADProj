package com.antifsad.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicalRecordRequest {

    @NotNull
    private Long patientId;

    @NotBlank
    private String fileUrl;

    private String description;

    @NotBlank
    private String uploadedBy;
}
