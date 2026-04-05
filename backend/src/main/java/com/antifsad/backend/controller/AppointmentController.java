package com.antifsad.backend.controller;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.AppointmentStatus;
import com.antifsad.backend.service.AuthFacade;
import com.antifsad.backend.service.AppointmentService;
import com.antifsad.backend.service.ConsultationAccessService;
import com.antifsad.backend.web.dto.AppointmentRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final ConsultationAccessService consultationAccessService;
    private final AuthFacade authFacade;

    public AppointmentController(AppointmentService appointmentService,
                                 ConsultationAccessService consultationAccessService,
                                 AuthFacade authFacade) {
        this.appointmentService = appointmentService;
        this.consultationAccessService = consultationAccessService;
        this.authFacade = authFacade;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Appointment>> getAll() {
        return ResponseEntity.ok(appointmentService.getAll());
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<List<Appointment>> getForPatient(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(appointmentService.getForPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<List<Appointment>> getForDoctor(@PathVariable("doctorId") Long doctorId) {
        return ResponseEntity.ok(appointmentService.getForDoctor(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/date/{date}")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<List<Appointment>> getForDoctorOnDate(@PathVariable("doctorId") Long doctorId,
                                                                @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getForDoctorOnDate(doctorId, date));
    }

    @GetMapping("/doctors/{doctorId}/availability")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<?> getDoctorAvailability(@PathVariable Long doctorId,
                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getDoctorAvailability(doctorId, date));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_PATIENT','ROLE_ADMIN')")
    public ResponseEntity<Appointment> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(consultationAccessService.requireParticipant(id, authFacade.getCurrentUser()));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_ADMIN')")
    public ResponseEntity<Appointment> create(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.createAppointment(
                request.getPatientId(),
                request.getDoctorId(),
                request.getDate(),
                request.getTime(),
                request.getMode(),
                request.getReason()
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_ADMIN')")
    public ResponseEntity<Appointment> update(@PathVariable("id") Long id,
                                              @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(
                id,
                request.getPatientId(),
                request.getDoctorId(),
                request.getDate(),
                request.getTime(),
                request.getMode(),
                request.getReason()
        ));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<Appointment> updateStatus(@PathVariable("id") Long id,
                                                    @RequestParam("status") AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
