package com.antifsad.backend.controller;

import com.antifsad.backend.service.AppointmentService;
import com.antifsad.backend.service.AuthFacade;
import com.antifsad.backend.service.PrescriptionService;
import com.antifsad.backend.web.dto.PrescriptionItemRequest;
import com.antifsad.backend.web.dto.PrescriptionRequest;
import com.antifsad.backend.web.dto.PrescriptionResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping({"/api/doctor", "/doctor"})
@PreAuthorize("hasAuthority('ROLE_DOCTOR')")
public class DoctorController {

    private final AppointmentService appointmentService;
    private final PrescriptionService prescriptionService;
    private final AuthFacade authFacade;

    public DoctorController(AppointmentService appointmentService,
                            PrescriptionService prescriptionService,
                            AuthFacade authFacade) {
        this.appointmentService = appointmentService;
        this.prescriptionService = prescriptionService;
        this.authFacade = authFacade;
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getMyAppointments() {
        return ResponseEntity.ok(appointmentService.getForDoctor(authFacade.getCurrentUser().getId()));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getMyPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getForDoctor(authFacade.getCurrentUser().getId()).stream()
                .map(PrescriptionResponse::from)
                .toList());
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<?> createPrescription(@Valid @RequestBody PrescriptionRequest request) {
        Long currentDoctorId = authFacade.getCurrentUser().getId();
        return ResponseEntity.ok(PrescriptionResponse.from(prescriptionService.createPrescription(
                currentDoctorId,
                request.getPatientId(),
                request.getAppointmentId(),
                resolveItems(request),
                request.getNotes()
        )));
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
