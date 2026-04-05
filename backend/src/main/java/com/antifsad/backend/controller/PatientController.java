package com.antifsad.backend.controller;

import com.antifsad.backend.service.AppointmentService;
import com.antifsad.backend.service.AuthFacade;
import com.antifsad.backend.service.MedicineOrderService;
import com.antifsad.backend.service.PrescriptionService;
import com.antifsad.backend.web.dto.AppointmentRequest;
import com.antifsad.backend.web.dto.MedicineOrderRequest;
import com.antifsad.backend.web.dto.MedicineOrderResponse;
import com.antifsad.backend.web.dto.PrescriptionResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/patient", "/patient"})
@PreAuthorize("hasAuthority('ROLE_PATIENT')")
public class PatientController {

    private final AppointmentService appointmentService;
    private final PrescriptionService prescriptionService;
    private final MedicineOrderService medicineOrderService;
    private final AuthFacade authFacade;

    public PatientController(AppointmentService appointmentService,
                             PrescriptionService prescriptionService,
                             MedicineOrderService medicineOrderService,
                             AuthFacade authFacade) {
        this.appointmentService = appointmentService;
        this.prescriptionService = prescriptionService;
        this.medicineOrderService = medicineOrderService;
        this.authFacade = authFacade;
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getMyAppointments() {
        return ResponseEntity.ok(appointmentService.getForPatient(authFacade.getCurrentUser().getId()));
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        Long currentPatientId = authFacade.getCurrentUser().getId();
        return ResponseEntity.ok(appointmentService.createAppointment(
                currentPatientId,
                request.getDoctorId(),
                request.getDate(),
                request.getTime(),
                request.getMode(),
                request.getReason()
        ));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getMyPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getForPatient(authFacade.getCurrentUser().getId()).stream()
                .map(PrescriptionResponse::from)
                .toList());
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders() {
        return ResponseEntity.ok(medicineOrderService.getForPatient(authFacade.getCurrentUser().getId()).stream()
                .map(MedicineOrderResponse::from)
                .toList());
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@Valid @RequestBody MedicineOrderRequest request) {
        request.setPatientId(authFacade.getCurrentUser().getId());
        return ResponseEntity.ok(MedicineOrderResponse.from(medicineOrderService.createOrder(request)));
    }
}
