package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.MedicineOrder;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class MedicineOrderResponse {

    private Long id;
    private String status;
    private Long patientId;
    private String patientName;
    private Long pharmacistId;
    private String pharmacistName;
    private Long prescriptionId;
    private String deliveryAddress;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
    private List<MedicineOrderItemResponse> items;

    public static MedicineOrderResponse from(MedicineOrder order) {
        return MedicineOrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .patientId(order.getPatient() != null ? order.getPatient().getId() : null)
                .patientName(order.getPatient() != null ? order.getPatient().getName() : null)
                .pharmacistId(order.getPharmacist() != null ? order.getPharmacist().getId() : null)
                .pharmacistName(order.getPharmacist() != null ? order.getPharmacist().getName() : null)
                .prescriptionId(order.getPrescription() != null ? order.getPrescription().getId() : null)
                .deliveryAddress(order.getDeliveryAddress())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getItems() == null ? List.of() : order.getItems().stream().map(MedicineOrderItemResponse::from).toList())
                .build();
    }
}
