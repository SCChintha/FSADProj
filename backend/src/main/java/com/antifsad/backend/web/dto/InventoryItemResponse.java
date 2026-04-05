package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.InventoryItem;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@ToString
public class InventoryItemResponse {
    private Long id;
    private String name;
    private int stock;
    private BigDecimal price;
    private LocalDate expiryDate;
    private String usage;
    private String sideEffects;
    private String typicalDosage;
    private int lowStockThreshold;
    private Long pharmacistId;

    public static InventoryItemResponse from(InventoryItem item) {
        return InventoryItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .stock(item.getStock())
                .price(item.getPrice())
                .expiryDate(item.getExpiryDate())
                .usage(item.getUsage())
                .sideEffects(item.getSideEffects())
                .typicalDosage(item.getTypicalDosage())
                .lowStockThreshold(item.getLowStockThreshold())
                .pharmacistId(item.getPharmacist() != null ? item.getPharmacist().getId() : null)
                .build();
    }
}
