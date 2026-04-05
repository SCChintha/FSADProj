package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.MedicineOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicineOrderStatusUpdateRequest {

    @NotNull
    private MedicineOrderStatus status;

    private String notes;
}
