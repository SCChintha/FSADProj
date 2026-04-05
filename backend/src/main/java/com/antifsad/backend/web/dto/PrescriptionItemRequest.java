package com.antifsad.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrescriptionItemRequest {

    @NotBlank
    private String medicineName;

    @NotBlank
    private String dosage;

    @NotBlank
    private String duration;

    private String instructions;
}
