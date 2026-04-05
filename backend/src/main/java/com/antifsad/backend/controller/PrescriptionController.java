package com.antifsad.backend.controller;

import com.antifsad.backend.model.Prescription;
import com.antifsad.backend.model.PrescriptionStatus;
import com.antifsad.backend.service.PrescriptionService;
import com.antifsad.backend.web.dto.PrescriptionItemRequest;
import com.antifsad.backend.web.dto.PrescriptionResponse;
import com.antifsad.backend.web.dto.PrescriptionRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping({"/api/prescriptions", "/prescriptions"})
public class PrescriptionController {
    private static final Logger log = LoggerFactory.getLogger(PrescriptionController.class);

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_PHARMACIST','ROLE_ADMIN')")
    public ResponseEntity<List<PrescriptionResponse>> getAll() {
        List<PrescriptionResponse> response = prescriptionService.getAll().stream()
                .map(PrescriptionResponse::from)
                .toList();
        log.info("GET /prescriptions -> {} records {}", response.size(), response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_DOCTOR','ROLE_PHARMACIST','ROLE_ADMIN')")
    public ResponseEntity<List<PrescriptionResponse>> getForPatient(@PathVariable("patientId") Long patientId) {
        List<PrescriptionResponse> response = prescriptionService.getForPatient(patientId).stream()
                .map(PrescriptionResponse::from)
                .toList();
        log.info("GET /prescriptions/patient/{} -> {} records {}", patientId, response.size(), response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<List<PrescriptionResponse>> getForDoctor(@PathVariable("doctorId") Long doctorId) {
        List<PrescriptionResponse> response = prescriptionService.getForDoctor(doctorId).stream()
                .map(PrescriptionResponse::from)
                .toList();
        log.info("GET /prescriptions/doctor/{} -> {} records {}", doctorId, response.size(), response);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<PrescriptionResponse> create(@Valid @RequestBody PrescriptionRequest request) {
        Prescription prescription = prescriptionService.createPrescription(
                request.getDoctorId(),
                request.getPatientId(),
                request.getAppointmentId(),
                resolveItems(request),
                request.getNotes()
        );
        PrescriptionResponse response = PrescriptionResponse.from(prescription);
        log.info("POST /prescriptions -> {}", response);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<PrescriptionResponse> update(@PathVariable("id") Long id,
                                                       @Valid @RequestBody PrescriptionRequest request) {
        Prescription prescription = prescriptionService.updatePrescription(
                id,
                request.getDoctorId(),
                request.getPatientId(),
                request.getAppointmentId(),
                resolveItems(request),
                request.getNotes()
        );
        PrescriptionResponse response = PrescriptionResponse.from(prescription);
        log.info("PUT /prescriptions/{} -> {}", id, response);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_PHARMACIST','ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<PrescriptionResponse> updateStatus(@PathVariable("id") Long id,
                                                             @RequestParam("status") PrescriptionStatus status) {
        PrescriptionResponse response = PrescriptionResponse.from(prescriptionService.updateStatus(id, status));
        log.info("PATCH /prescriptions/{}/status -> {}", id, response);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }

    private List<PrescriptionItemRequest> resolveItems(PrescriptionRequest request) {
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            return request.getItems();
        }
        if (request.getMedicine() == null || request.getDosage() == null || request.getDuration() == null) {
            throw new IllegalArgumentException("Prescription item details are required");
        }
        PrescriptionItemRequest item = new PrescriptionItemRequest();
        item.setMedicineName(request.getMedicine());
        item.setDosage(request.getDosage());
        item.setDuration(request.getDuration());
        item.setInstructions(request.getNotes());
        return new ArrayList<>(List.of(item));
    }
}
