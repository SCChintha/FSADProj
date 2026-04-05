package com.antifsad.backend.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PrescriptionRequest {

    private Long doctorId;

    @NotNull
    private Long patientId;

    private Long appointmentId;

    private List<PrescriptionItemRequest> items;

    // Legacy fields kept so existing clients still work.
    private String medicine;

    private String dosage;

    private String duration;

    private String notes;
}
