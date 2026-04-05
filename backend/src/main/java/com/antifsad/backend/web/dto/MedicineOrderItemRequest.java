package com.antifsad.backend.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicineOrderItemRequest {

    @NotNull
    private Long inventoryItemId;

    @NotNull
    @Min(1)
    private Integer quantity;

    private String dosageInstruction;
}
