package com.antifsad.backend.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class InventoryItemRequest {

    @NotBlank
    private String name;

    @Min(0)
    private int stock;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
    private BigDecimal price;

    private LocalDate expiryDate;

    private String usage;

    private String sideEffects;

    private String typicalDosage;

    @NotNull
    @Min(0)
    private Integer lowStockThreshold;
}
