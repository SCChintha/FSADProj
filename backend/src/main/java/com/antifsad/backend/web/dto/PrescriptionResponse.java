package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.Prescription;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@ToString
public class PrescriptionResponse {
    private Long id;
    private LocalDate date;
    private String status;
    private String notes;
    private Long appointmentId;
    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private String patientName;
    private String medicineName;
    private String dosage;
    private String duration;
    private UserSummaryResponse doctor;
    private UserSummaryResponse patient;
    private List<PrescriptionItemResponse> items;

    public static PrescriptionResponse from(Prescription prescription) {
        List<PrescriptionItemResponse> itemResponses = prescription.getItems() == null
                ? List.of()
                : prescription.getItems().stream()
                .map(PrescriptionItemResponse::from)
                .toList();

        PrescriptionItemResponse firstItem = itemResponses.isEmpty() ? null : itemResponses.get(0);

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .date(prescription.getDate())
                .status(prescription.getStatus() != null ? prescription.getStatus().name() : null)
                .notes(prescription.getNotes())
                .appointmentId(prescription.getAppointment() != null ? prescription.getAppointment().getId() : null)
                .doctorId(prescription.getDoctor() != null ? prescription.getDoctor().getId() : null)
                .doctorName(prescription.getDoctor() != null ? prescription.getDoctor().getName() : null)
                .patientId(prescription.getPatient() != null ? prescription.getPatient().getId() : null)
                .patientName(prescription.getPatient() != null ? prescription.getPatient().getName() : null)
                .medicineName(firstItem != null ? firstItem.getMedicineName() : null)
                .dosage(firstItem != null ? firstItem.getDosage() : null)
                .duration(firstItem != null ? firstItem.getDuration() : null)
                .doctor(UserSummaryResponse.from(prescription.getDoctor()))
                .patient(UserSummaryResponse.from(prescription.getPatient()))
                .items(itemResponses)
                .build();
    }
}
