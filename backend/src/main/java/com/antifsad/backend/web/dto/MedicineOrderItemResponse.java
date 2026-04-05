package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.MedicineOrderItem;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MedicineOrderItemResponse {

    private Long id;
    private Long inventoryItemId;
    private String medicineName;
    private Integer quantity;
    private String dosageInstruction;
    private Integer availableStock;

    public static MedicineOrderItemResponse from(MedicineOrderItem item) {
        return MedicineOrderItemResponse.builder()
                .id(item.getId())
                .inventoryItemId(item.getInventoryItem() != null ? item.getInventoryItem().getId() : null)
                .medicineName(item.getInventoryItem() != null ? item.getInventoryItem().getName() : null)
                .quantity(item.getQuantity())
                .dosageInstruction(item.getDosageInstruction())
                .availableStock(item.getInventoryItem() != null ? item.getInventoryItem().getStock() : null)
                .build();
    }
}
