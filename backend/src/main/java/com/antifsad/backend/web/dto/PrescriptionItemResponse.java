package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.PrescriptionItem;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class PrescriptionItemResponse {
    private Long id;
    private String medicineName;
    private String dosage;
    private String duration;
    private String instructions;

    public static PrescriptionItemResponse from(PrescriptionItem item) {
        if (item == null) {
            return null;
        }

        return PrescriptionItemResponse.builder()
                .id(item.getId())
                .medicineName(item.getMedicineName())
                .dosage(item.getDosage())
                .duration(item.getDuration())
                .instructions(item.getInstructions())
                .build();
    }
}
