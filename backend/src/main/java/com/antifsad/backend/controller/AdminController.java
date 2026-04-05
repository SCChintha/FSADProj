package com.antifsad.backend.controller;

import com.antifsad.backend.model.AppointmentStatus;
import com.antifsad.backend.model.ComplaintStatus;
import com.antifsad.backend.model.MedicineOrderStatus;
import com.antifsad.backend.model.PrescriptionStatus;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.UserStatus;
import com.antifsad.backend.service.AdminUserService;
import com.antifsad.backend.service.AuthFacade;
import com.antifsad.backend.web.dto.admin.AdminAppointmentRescheduleRequest;
import com.antifsad.backend.web.dto.admin.AdminApprovalRequest;
import com.antifsad.backend.web.dto.admin.AdminComplaintCreateRequest;
import com.antifsad.backend.web.dto.admin.AdminComplaintUpdateRequest;
import com.antifsad.backend.web.dto.admin.AdminModerationRequest;
import com.antifsad.backend.web.dto.admin.AdminSettingsUpdateRequest;
import com.antifsad.backend.web.dto.admin.AdminUserUpdateRequest;
import com.antifsad.backend.web.dto.UserCreateRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final AdminUserService adminUserService;
    private final AuthFacade authFacade;

    public AdminController(AdminUserService adminUserService, AuthFacade authFacade) {
        this.adminUserService = adminUserService;
        this.authFacade = authFacade;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size,
                                      @RequestParam(required = false) Role role,
                                      @RequestParam(required = false) UserStatus status,
                                      @RequestParam(required = false) String approvalState,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdFrom,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdTo,
                                      @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminUserService.getUsers(search, role, status, approvalState, createdFrom, createdTo, PageRequest.of(page, size)));
    }

    @GetMapping("/users/{userId}/detail")
    public ResponseEntity<?> getUserDetail(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.getUserDetail(userId));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(adminUserService.createUser(request));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long userId, @RequestBody AdminUserUpdateRequest request) {
        return ResponseEntity.ok(adminUserService.updateUserProfile(userId, request, authFacade.getCurrentUser()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId, @RequestBody AdminModerationRequest body) {
        return ResponseEntity.ok(adminUserService.toggleUserStatus(userId, body, authFacade.getCurrentUser()));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        adminUserService.deleteUser(userId, authFacade.getCurrentUser());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/doctors/{userId}/approval")
    public ResponseEntity<?> approveDoctor(@PathVariable Long userId, @RequestBody AdminApprovalRequest body) {
        adminUserService.approvePractitioner(userId, Role.DOCTOR, body, authFacade.getCurrentUser());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/pharmacists/{userId}/approval")
    public ResponseEntity<?> approvePharmacist(@PathVariable Long userId, @RequestBody AdminApprovalRequest body) {
        adminUserService.approvePractitioner(userId, Role.PHARMACIST, body, authFacade.getCurrentUser());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.resetPassword(userId, authFacade.getCurrentUser()));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminUserService.getStats());
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(@RequestParam(required = false) AppointmentStatus status,
                                             @RequestParam(required = false) Long doctorId,
                                             @RequestParam(required = false) Long patientId,
                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(adminUserService.getAppointments(status, doctorId, patientId, date));
    }

    @PutMapping("/appointments/{appointmentId}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long appointmentId, @RequestBody AdminAppointmentRescheduleRequest request) {
        return ResponseEntity.ok(adminUserService.rescheduleAppointment(appointmentId, request, authFacade.getCurrentUser()));
    }

    @PutMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(adminUserService.cancelAppointment(appointmentId, authFacade.getCurrentUser()));
    }

    @GetMapping("/doctors/{doctorId}/availability")
    public ResponseEntity<?> getDoctorAvailability(@PathVariable Long doctorId,
                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(adminUserService.getDoctorAvailability(doctorId, date));
    }

    @GetMapping("/complaints")
    public ResponseEntity<?> getComplaints(@RequestParam(required = false) ComplaintStatus status,
                                           @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminUserService.getComplaints(status, search));
    }

    @PostMapping("/complaints")
    public ResponseEntity<?> createComplaint(@RequestBody AdminComplaintCreateRequest request) {
        return ResponseEntity.ok(adminUserService.createComplaint(request, authFacade.getCurrentUser()));
    }

    @PutMapping("/complaints/{complaintId}")
    public ResponseEntity<?> updateComplaint(@PathVariable Long complaintId, @RequestBody AdminComplaintUpdateRequest request) {
        return ResponseEntity.ok(adminUserService.updateComplaint(complaintId, request, authFacade.getCurrentUser()));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getPrescriptionMonitoring(@RequestParam(required = false) PrescriptionStatus status,
                                                       @RequestParam(required = false) Long doctorId,
                                                       @RequestParam(required = false) Long patientId,
                                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(adminUserService.getPrescriptionMonitoring(status, doctorId, patientId, from, to));
    }

    @GetMapping("/prescriptions/summary")
    public ResponseEntity<?> getPrescriptionSummary() {
        return ResponseEntity.ok(adminUserService.getPrescriptionSummary());
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getMedicineOrders(@RequestParam(required = false) MedicineOrderStatus status,
                                               @RequestParam(required = false) Long patientId,
                                               @RequestParam(required = false) Long pharmacistId) {
        return ResponseEntity.ok(adminUserService.getMedicineOrders(status, patientId, pharmacistId));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size,
                                     @RequestParam(required = false) String action,
                                     @RequestParam(required = false) Long actorId,
                                     @RequestParam(required = false) Long targetId,
                                     @RequestParam(required = false) String severity,
                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(adminUserService.getLogs(action, actorId, targetId, from, to, severity, PageRequest.of(page, size)));
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(adminUserService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody AdminSettingsUpdateRequest request) {
        return ResponseEntity.ok(adminUserService.updateSettings(request, authFacade.getCurrentUser()));
    }
}
