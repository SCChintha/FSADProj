package com.antifsad.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MedicineOrderRequest {

    private Long patientId;

    private Long pharmacistId;

    private Long prescriptionId;

    @NotBlank
    private String deliveryAddress;

    private String notes;

    @NotNull
    private List<MedicineOrderItemRequest> items;
}
