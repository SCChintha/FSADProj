package com.antifsad.backend.service;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.AppointmentStatus;
import com.antifsad.backend.model.Complaint;
import com.antifsad.backend.model.ComplaintStatus;
import com.antifsad.backend.model.InventoryItem;
import com.antifsad.backend.model.MedicineOrder;
import com.antifsad.backend.model.MedicineOrderStatus;
import com.antifsad.backend.model.Prescription;
import com.antifsad.backend.model.PrescriptionStatus;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.SystemSetting;
import com.antifsad.backend.model.User;
import com.antifsad.backend.model.UserStatus;
import com.antifsad.backend.repository.AppointmentRepository;
import com.antifsad.backend.repository.AuditLogRepository;
import com.antifsad.backend.repository.ComplaintRepository;
import com.antifsad.backend.repository.InventoryItemRepository;
import com.antifsad.backend.repository.MedicalRecordRepository;
import com.antifsad.backend.repository.MedicineOrderRepository;
import com.antifsad.backend.repository.PrescriptionRepository;
import com.antifsad.backend.repository.SystemSettingRepository;
import com.antifsad.backend.repository.UserRepository;
import com.antifsad.backend.web.dto.admin.AdminAppointmentRescheduleRequest;
import com.antifsad.backend.web.dto.admin.AdminApprovalRequest;
import com.antifsad.backend.web.dto.admin.AdminAuditLogResponse;
import com.antifsad.backend.web.dto.admin.AdminComplaintCreateRequest;
import com.antifsad.backend.web.dto.admin.AdminComplaintResponse;
import com.antifsad.backend.web.dto.admin.AdminComplaintUpdateRequest;
import com.antifsad.backend.web.dto.admin.AdminModerationRequest;
import com.antifsad.backend.web.dto.admin.AdminSettingsResponse;
import com.antifsad.backend.web.dto.admin.AdminSettingsUpdateRequest;
import com.antifsad.backend.web.dto.admin.AdminUserDetailResponse;
import com.antifsad.backend.web.dto.admin.AdminUserSummaryResponse;
import com.antifsad.backend.web.dto.admin.AdminUserUpdateRequest;
import com.antifsad.backend.web.dto.MedicineOrderResponse;
import com.antifsad.backend.web.dto.UserCreateRequest;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final ProfileService profileService;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicineOrderRepository medicineOrderRepository;
    private final AppointmentService appointmentService;
    private final AuditLogService auditLogService;
    private final UserService userService;

    public AdminUserService(UserRepository userRepository,
                            EmailService emailService,
                            PasswordEncoder passwordEncoder,
                            ProfileService profileService,
                            AppointmentRepository appointmentRepository,
                            PrescriptionRepository prescriptionRepository,
                            ComplaintRepository complaintRepository,
                            AuditLogRepository auditLogRepository,
                            SystemSettingRepository systemSettingRepository,
                            InventoryItemRepository inventoryItemRepository,
                            MedicalRecordRepository medicalRecordRepository,
                            MedicineOrderRepository medicineOrderRepository,
                            AppointmentService appointmentService,
                            AuditLogService auditLogService,
                            UserService userService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.profileService = profileService;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.complaintRepository = complaintRepository;
        this.auditLogRepository = auditLogRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.medicineOrderRepository = medicineOrderRepository;
        this.appointmentService = appointmentService;
        this.auditLogService = auditLogService;
        this.userService = userService;
    }

    public Page<AdminUserSummaryResponse> getUsers(String search,
                                                   Role role,
                                                   UserStatus status,
                                                   String approvalState,
                                                   LocalDate createdFrom,
                                                   LocalDate createdTo,
                                                   Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("email")), searchPattern)
                ));
            }
            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (createdFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom.atStartOfDay().toInstant(ZoneOffset.UTC)));
            }
            if (createdTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), createdTo.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)));
            }
            if (approvalState != null && !approvalState.isBlank()) {
                String normalized = approvalState.toUpperCase();
                if ("PENDING".equals(normalized)) {
                    predicates.add(root.get("role").in(Role.DOCTOR, Role.PHARMACIST));
                    predicates.add(cb.isFalse(root.get("isApproved")));
                } else if ("APPROVED".equals(normalized)) {
                    predicates.add(root.get("role").in(Role.DOCTOR, Role.PHARMACIST));
                    predicates.add(cb.isTrue(root.get("isApproved")));
                } else if ("NOT_REQUIRED".equals(normalized)) {
                    predicates.add(cb.not(root.get("role").in(Role.DOCTOR, Role.PHARMACIST)));
                }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return userRepository.findAll(spec, pageable).map(AdminUserSummaryResponse::from);
    }

    public AdminUserDetailResponse getUserDetail(Long userId) {
        User user = getUser(userId);
        return AdminUserDetailResponse.builder()
                .user(AdminUserSummaryResponse.from(user))
                .profile(profileService.getProfileByUserId(userId))
                .build();
    }

    @Transactional
    public AdminUserDetailResponse createUser(UserCreateRequest request) {
        User user = userService.createUser(request);
        return getUserDetail(user.getId());
    }

    @Transactional
    public AdminUserDetailResponse updateUserProfile(Long userId, AdminUserUpdateRequest request, User actor) {
        User user = getUser(userId);
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getStatus() != null) {
            user.setStatus(UserStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getIsApproved() != null && requiresApproval(user)) {
            user.setIsApproved(request.getIsApproved());
        }
        userRepository.save(user);

        Map<String, Object> mergedProfile = new HashMap<>();
        if (request.getProfileData() != null) {
            mergedProfile.putAll(request.getProfileData());
        }
        if (request.getStatus() != null) {
            mergedProfile.put("status", request.getStatus());
        }
        if (request.getIsApproved() != null) {
            mergedProfile.put("isApproved", request.getIsApproved());
        }
        if (!mergedProfile.isEmpty()) {
            profileService.updateProfileByUserId(userId, mergedProfile);
        }

        auditLogService.log(actor, "ADMIN_UPDATED_USER", "ADMIN", "INFO", "USER", userId, "Admin updated user profile", Map.of("name", safeText(request.getName())));
        return getUserDetail(userId);
    }

    @Transactional
    public Map<String, Object> toggleUserStatus(Long userId, AdminModerationRequest body, User actor) {
        User user = getUser(userId);
        if (body.getStatus() == null) {
            throw new IllegalArgumentException("Status is required");
        }
        UserStatus previousStatus = user.getStatus();
        UserStatus nextStatus = UserStatus.valueOf(body.getStatus().toUpperCase());
        user.setStatus(nextStatus);
        userRepository.save(user);

        auditLogService.log(actor, "ADMIN_CHANGED_USER_STATUS", "SECURITY", nextStatus == UserStatus.DISABLED ? "WARN" : "INFO", "USER", userId, "Changed user status from " + previousStatus + " to " + nextStatus, Map.of("reason", safeText(body.getReason())));
        return Map.of("message", "User status updated", "userId", userId, "newStatus", user.getStatus().name());
    }

    @Transactional
    public void approvePractitioner(Long userId, Role expectedRole, AdminApprovalRequest body, User actor) {
        User user = getUser(userId);
        if (user.getRole() != expectedRole) {
            throw new IllegalArgumentException("User role does not match approval workflow");
        }
        boolean approved = Boolean.TRUE.equals(body.getApproved());
        user.setIsApproved(approved);
        if (!approved) {
            user.setStatus(UserStatus.DISABLED);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }
        userRepository.save(user);

        String decision = approved ? "approved" : "rejected";
        emailService.sendEmail(
                user.getEmail(),
                expectedRole.name() + " account " + decision,
                approved ? "Your account has been approved. Notes: " + safeText(body.getVerificationNotes())
                        : "Your account was rejected. Reason: " + safeText(body.getReason())
        );
        auditLogService.log(actor, "ADMIN_" + expectedRole.name() + "_APPROVAL", "APPROVAL", approved ? "INFO" : "WARN", "USER", userId, "Admin " + decision + " account", Map.of("reason", safeText(body.getReason()), "verificationNotes", safeText(body.getVerificationNotes())));
    }

    @Transactional
    public Map<String, String> resetPassword(Long userId, User actor) {
        User user = getUser(userId);
        String tempPass = UUID.randomUUID().toString().substring(0, 10);
        user.setPasswordHash(passwordEncoder.encode(tempPass));
        userRepository.save(user);
        emailService.sendEmail(user.getEmail(), "Password Reset", "Your temporary password is: " + tempPass);
        auditLogService.log(actor, "ADMIN_RESET_PASSWORD", "SECURITY", "WARN", "USER", userId, "Password reset issued by admin", (Map<String, ?>) null);
        return Map.of("message", "Password reset email sent");
    }

    @Transactional
    public void deleteUser(Long userId, User actor) {
        User user = getUser(userId);
        auditLogService.log(actor, "ADMIN_DELETED_USER", "ADMIN", "WARN", "USER", userId, "Admin deleted user " + user.getEmail(), (Map<String, ?>) null);
        complaintRepository.findAll().stream()
                .filter(complaint -> (complaint.getCreatedByUser() != null && userId.equals(complaint.getCreatedByUser().getId()))
                        || (complaint.getTargetUser() != null && userId.equals(complaint.getTargetUser().getId()))
                        || (complaint.getAssignedAdmin() != null && userId.equals(complaint.getAssignedAdmin().getId()))
                        || (complaint.getRelatedAppointment() != null && complaint.getRelatedAppointment().getDoctor() != null && userId.equals(complaint.getRelatedAppointment().getDoctor().getId()))
                        || (complaint.getRelatedAppointment() != null && complaint.getRelatedAppointment().getPatient() != null && userId.equals(complaint.getRelatedAppointment().getPatient().getId()))
                        || (complaint.getRelatedPrescription() != null && complaint.getRelatedPrescription().getDoctor() != null && userId.equals(complaint.getRelatedPrescription().getDoctor().getId()))
                        || (complaint.getRelatedPrescription() != null && complaint.getRelatedPrescription().getPatient() != null && userId.equals(complaint.getRelatedPrescription().getPatient().getId())))
                .forEach(complaintRepository::delete);
        userService.deleteUser(userId);
    }

    public Map<String, Object> getStats() {
        List<User> users = userRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();
        List<Prescription> prescriptions = prescriptionRepository.findAll();
        List<MedicineOrder> medicineOrders = medicineOrderRepository.findAll();
        List<Complaint> complaints = complaintRepository.findAll();
        List<InventoryItem> inventoryItems = inventoryItemRepository.findAll();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalUsers", users.size());
        summary.put("activeUsers", users.stream().filter(user -> user.getStatus() == UserStatus.ACTIVE).count());
        summary.put("disabledUsers", users.stream().filter(user -> user.getStatus() == UserStatus.DISABLED).count());
        summary.put("pendingApprovals", users.stream().filter(user -> requiresApproval(user) && !Boolean.TRUE.equals(user.getIsApproved())).count());
        summary.put("appointments", appointments.size());
        summary.put("prescriptions", prescriptions.size());
        summary.put("medicineOrders", medicineOrders.size());
        summary.put("complaints", complaints.size());
        summary.put("lowStockItems", inventoryItems.stream().filter(item -> item.getStock() <= item.getLowStockThreshold()).count());
        summary.put("medicalRecords", medicalRecordRepository.count());

        Map<String, Long> userBreakdown = users.stream().collect(Collectors.groupingBy(user -> user.getRole().name(), Collectors.counting()));
        Map<String, Long> appointmentBreakdown = appointments.stream().collect(Collectors.groupingBy(appointment -> appointment.getStatus().name(), Collectors.counting()));
        Map<String, Long> prescriptionBreakdown = prescriptions.stream().collect(Collectors.groupingBy(prescription -> prescription.getStatus().name(), Collectors.counting()));
        Map<String, Long> orderBreakdown = medicineOrders.stream().collect(Collectors.groupingBy(order -> order.getStatus().name(), Collectors.counting()));
        Map<String, Long> complaintBreakdown = complaints.stream().collect(Collectors.groupingBy(complaint -> complaint.getStatus().name(), Collectors.counting()));

        Map<String, Object> approvalQueue = new LinkedHashMap<>();
        approvalQueue.put("doctorsPending", users.stream().filter(user -> user.getRole() == Role.DOCTOR && !Boolean.TRUE.equals(user.getIsApproved())).count());
        approvalQueue.put("pharmacistsPending", users.stream().filter(user -> user.getRole() == Role.PHARMACIST && !Boolean.TRUE.equals(user.getIsApproved())).count());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("summary", summary);
        payload.put("userBreakdown", userBreakdown);
        payload.put("appointmentBreakdown", appointmentBreakdown);
        payload.put("prescriptionBreakdown", prescriptionBreakdown);
        payload.put("orderBreakdown", orderBreakdown);
        payload.put("complaintBreakdown", complaintBreakdown);
        payload.put("activitySeries", buildActivitySeries(users, appointments, complaints));
        payload.put("approvalQueue", approvalQueue);
        payload.put("recentComplaints", complaints.stream().sorted(Comparator.comparing(Complaint::getCreatedAt).reversed()).limit(5).map(AdminComplaintResponse::from).toList());
        payload.put("recentLogs", auditLogRepository.findAll().stream()
                .sorted(Comparator.comparing((com.antifsad.backend.model.AuditLog log) -> log.getCreatedAt(),
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(8)
                .map(AdminAuditLogResponse::from)
                .toList());
        return payload;
    }

    public List<Map<String, Object>> getAppointments(AppointmentStatus status, Long doctorId, Long patientId, LocalDate date) {
        return appointmentRepository.findAll().stream()
                .filter(appointment -> status == null || appointment.getStatus() == status)
                .filter(appointment -> doctorId == null || (appointment.getDoctor() != null && doctorId.equals(appointment.getDoctor().getId())))
                .filter(appointment -> patientId == null || (appointment.getPatient() != null && patientId.equals(appointment.getPatient().getId())))
                .filter(appointment -> date == null || date.equals(appointment.getDate()))
                .sorted(Comparator.comparing(Appointment::getDate).thenComparing(Appointment::getTime))
                .map(this::mapAppointment)
                .toList();
    }

    @Transactional
    public Map<String, Object> rescheduleAppointment(Long appointmentId, AdminAppointmentRescheduleRequest request, User actor) {
        Appointment updated = appointmentService.updateAppointment(appointmentId, request.getPatientId(), request.getDoctorId(), request.getDate(), request.getTime(), request.getMode(), request.getReason());
        auditLogService.log(actor, "ADMIN_RESCHEDULED_APPOINTMENT", "APPOINTMENT", "INFO", "APPOINTMENT", appointmentId, "Appointment rescheduled", Map.of("date", String.valueOf(request.getDate()), "time", String.valueOf(request.getTime())));
        return mapAppointment(updated);
    }

    @Transactional
    public Map<String, Object> cancelAppointment(Long appointmentId, User actor) {
        Appointment updated = appointmentService.updateStatus(appointmentId, AppointmentStatus.CANCELLED);
        auditLogService.log(actor, "ADMIN_CANCELLED_APPOINTMENT", "APPOINTMENT", "WARN", "APPOINTMENT", appointmentId, "Appointment cancelled", (Map<String, ?>) null);
        return mapAppointment(updated);
    }

    public Map<String, Object> getDoctorAvailability(Long doctorId, LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByDoctorAndDate(getUser(doctorId), date);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("doctorId", doctorId);
        payload.put("date", date);
        payload.put("appointments", appointments.stream().map(this::mapAppointment).toList());
        payload.put("conflicts", appointments.stream()
                .collect(Collectors.groupingBy(appointment -> String.valueOf(appointment.getTime()), Collectors.counting()))
                .entrySet().stream()
                .filter(entry -> entry.getValue() > 1)
                .map(entry -> Map.of("time", entry.getKey(), "count", entry.getValue()))
                .toList());
        return payload;
    }

    public List<AdminComplaintResponse> getComplaints(ComplaintStatus status, String search) {
        return complaintRepository.findAll().stream()
                .filter(complaint -> status == null || complaint.getStatus() == status)
                .filter(complaint -> {
                    if (search == null || search.isBlank()) {
                        return true;
                    }
                    String normalized = search.toLowerCase();
                    return safeText(complaint.getSubject()).toLowerCase().contains(normalized)
                            || safeText(complaint.getDescription()).toLowerCase().contains(normalized)
                            || safeText(complaint.getCategory()).toLowerCase().contains(normalized);
                })
                .sorted(Comparator.comparing(Complaint::getCreatedAt).reversed())
                .map(AdminComplaintResponse::from)
                .toList();
    }

    @Transactional
    public AdminComplaintResponse createComplaint(AdminComplaintCreateRequest request, User actor) {
        Complaint complaint = Complaint.builder()
                .createdByUser(request.getCreatedByUserId() != null ? getUser(request.getCreatedByUserId()) : actor)
                .targetUser(request.getTargetUserId() != null ? getUser(request.getTargetUserId()) : null)
                .relatedAppointment(request.getRelatedAppointmentId() != null ? appointmentService.getById(request.getRelatedAppointmentId()) : null)
                .relatedPrescription(request.getRelatedPrescriptionId() != null ? prescriptionRepository.findById(request.getRelatedPrescriptionId()).orElse(null) : null)
                .category(request.getCategory())
                .subject(request.getSubject())
                .description(request.getDescription())
                .status(ComplaintStatus.OPEN)
                .assignedAdmin(actor)
                .build();
        Complaint saved = complaintRepository.save(complaint);
        auditLogService.log(actor, "ADMIN_CREATED_COMPLAINT", "COMPLAINT", "INFO", "COMPLAINT", saved.getId(), "Complaint created", (Map<String, ?>) null);
        return AdminComplaintResponse.from(saved);
    }

    @Transactional
    public AdminComplaintResponse updateComplaint(Long complaintId, AdminComplaintUpdateRequest request, User actor) {
        Complaint complaint = complaintRepository.findById(complaintId).orElseThrow(() -> new IllegalArgumentException("Complaint not found"));
        if (request.getStatus() != null) {
            complaint.setStatus(request.getStatus());
            if (request.getStatus() == ComplaintStatus.RESOLVED) {
                complaint.setResolvedAt(Instant.now());
            }
        }
        if (request.getAdminResponse() != null) {
            complaint.setAdminResponse(request.getAdminResponse());
        }
        if (request.getAssignedAdminId() != null) {
            complaint.setAssignedAdmin(getUser(request.getAssignedAdminId()));
        } else if (complaint.getAssignedAdmin() == null) {
            complaint.setAssignedAdmin(actor);
        }
        Complaint saved = complaintRepository.save(complaint);
        auditLogService.log(actor, "ADMIN_UPDATED_COMPLAINT", "COMPLAINT", "INFO", "COMPLAINT", complaintId, "Complaint updated", Map.of("status", saved.getStatus().name()));
        return AdminComplaintResponse.from(saved);
    }

    public List<Map<String, Object>> getPrescriptionMonitoring(PrescriptionStatus status, Long doctorId, Long patientId, LocalDate from, LocalDate to) {
        return prescriptionRepository.findAll().stream()
                .filter(prescription -> status == null || prescription.getStatus() == status)
                .filter(prescription -> doctorId == null || (prescription.getDoctor() != null && doctorId.equals(prescription.getDoctor().getId())))
                .filter(prescription -> patientId == null || (prescription.getPatient() != null && patientId.equals(prescription.getPatient().getId())))
                .filter(prescription -> from == null || !prescription.getDate().isBefore(from))
                .filter(prescription -> to == null || !prescription.getDate().isAfter(to))
                .sorted(Comparator.comparing(Prescription::getDate).reversed())
                .map(this::mapPrescription)
                .toList();
    }

    public Map<String, Object> getPrescriptionSummary() {
        List<Prescription> prescriptions = prescriptionRepository.findAll();
        long suspiciousCount = prescriptions.stream().filter(this::isSuspiciousPrescription).count();
        return Map.of(
                "total", prescriptions.size(),
                "issued", prescriptions.stream().filter(item -> item.getStatus() == PrescriptionStatus.ISSUED).count(),
                "dispensed", prescriptions.stream().filter(item -> item.getStatus() == PrescriptionStatus.DISPENSED).count(),
                "cancelled", prescriptions.stream().filter(item -> item.getStatus() == PrescriptionStatus.CANCELLED).count(),
                "suspicious", suspiciousCount
        );
    }

    public List<MedicineOrderResponse> getMedicineOrders(MedicineOrderStatus status, Long patientId, Long pharmacistId) {
        return medicineOrderRepository.findAll().stream()
                .filter(order -> status == null || order.getStatus() == status)
                .filter(order -> patientId == null || (order.getPatient() != null && patientId.equals(order.getPatient().getId())))
                .filter(order -> pharmacistId == null || (order.getPharmacist() != null && pharmacistId.equals(order.getPharmacist().getId())))
                .sorted(Comparator.comparing(MedicineOrder::getCreatedAt).reversed())
                .map(MedicineOrderResponse::from)
                .toList();
    }

    public Page<AdminAuditLogResponse> getLogs(String action, Long actorId, Long targetId, LocalDate from, LocalDate to, String severity, Pageable pageable) {
        Specification<com.antifsad.backend.model.AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (action != null && !action.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("action")), "%" + action.toLowerCase() + "%"));
            }
            if (actorId != null) {
                predicates.add(cb.equal(root.get("actor").get("id"), actorId));
            }
            if (targetId != null) {
                predicates.add(cb.equal(root.get("targetId"), targetId));
            }
            if (severity != null && !severity.isBlank()) {
                predicates.add(cb.equal(root.get("severity"), severity.toUpperCase()));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay().toInstant(ZoneOffset.UTC)));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return auditLogRepository.findAll(spec, pageable).map(AdminAuditLogResponse::from);
    }

    public AdminSettingsResponse getSettings() {
        Map<String, String> values = defaultSettings();
        for (SystemSetting systemSetting : systemSettingRepository.findAll()) {
            values.put(systemSetting.getSettingKey(), safeText(systemSetting.getSettingValue()));
        }
        return AdminSettingsResponse.builder().values(values).build();
    }

    @Transactional
    public AdminSettingsResponse updateSettings(AdminSettingsUpdateRequest request, User actor) {
        Map<String, String> values = defaultSettings();
        if (request.getValues() != null) {
            values.putAll(request.getValues());
        }
        values.forEach((key, value) -> systemSettingRepository.save(SystemSetting.builder()
                .settingKey(key)
                .settingValue(value)
                .description("Managed through admin dashboard")
                .build()));
        auditLogService.log(actor, "ADMIN_UPDATED_SETTINGS", "SETTINGS", "INFO", "SYSTEM", null, "Updated system settings", values);
        return getSettings();
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private boolean requiresApproval(User user) {
        return user.getRole() == Role.DOCTOR || user.getRole() == Role.PHARMACIST;
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }

    private boolean isSuspiciousPrescription(Prescription prescription) {
        return prescriptionRepository.findByPatient(prescription.getPatient()).stream()
                .filter(item -> item.getDate() != null && prescription.getDate() != null && !item.getDate().isBefore(prescription.getDate().minusDays(7)))
                .count() >= 3;
    }

    private List<Map<String, Object>> buildActivitySeries(List<User> users, List<Appointment> appointments, List<Complaint> complaints) {
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> series = new ArrayList<>();
        for (int index = 6; index >= 0; index--) {
            LocalDate day = today.minusDays(index);
            Instant start = day.atStartOfDay().toInstant(ZoneOffset.UTC);
            Instant end = day.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            long newUsers = users.stream().filter(user -> user.getCreatedAt() != null && !user.getCreatedAt().isBefore(start) && user.getCreatedAt().isBefore(end)).count();
            long dayAppointments = appointments.stream().filter(appointment -> day.equals(appointment.getDate())).count();
            long dayComplaints = complaints.stream().filter(complaint -> complaint.getCreatedAt() != null && !complaint.getCreatedAt().isBefore(start) && complaint.getCreatedAt().isBefore(end)).count();
            series.add(Map.of("day", day.toString(), "users", newUsers, "appointments", dayAppointments, "complaints", dayComplaints));
        }
        return series;
    }

    private Map<String, Object> mapAppointment(Appointment appointment) {
        long collisions = appointmentRepository.findByDoctorAndDate(appointment.getDoctor(), appointment.getDate()).stream()
                .filter(item -> item.getTime() != null && item.getTime().equals(appointment.getTime()))
                .count();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", appointment.getId());
        payload.put("date", appointment.getDate());
        payload.put("time", appointment.getTime());
        payload.put("status", appointment.getStatus().name());
        payload.put("mode", appointment.getMode() != null ? appointment.getMode().name() : "");
        payload.put("reason", safeText(appointment.getReason()));
        payload.put("doctorId", appointment.getDoctor() != null ? appointment.getDoctor().getId() : null);
        payload.put("doctorName", appointment.getDoctor() != null ? appointment.getDoctor().getName() : "");
        payload.put("patientId", appointment.getPatient() != null ? appointment.getPatient().getId() : null);
        payload.put("patientName", appointment.getPatient() != null ? appointment.getPatient().getName() : "");
        payload.put("hasConflict", collisions > 1);
        return payload;
    }

    private Map<String, Object> mapPrescription(Prescription prescription) {
        String medicineName = prescription.getItems() != null && !prescription.getItems().isEmpty() ? prescription.getItems().get(0).getMedicineName() : "";
        InventoryItem matchingInventory = inventoryItemRepository.findAll().stream()
                .filter(item -> item.getName().equalsIgnoreCase(medicineName))
                .findFirst()
                .orElse(null);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", prescription.getId());
        payload.put("date", prescription.getDate());
        payload.put("status", prescription.getStatus().name());
        payload.put("doctorId", prescription.getDoctor() != null ? prescription.getDoctor().getId() : null);
        payload.put("doctorName", prescription.getDoctor() != null ? prescription.getDoctor().getName() : "");
        payload.put("patientId", prescription.getPatient() != null ? prescription.getPatient().getId() : null);
        payload.put("patientName", prescription.getPatient() != null ? prescription.getPatient().getName() : "");
        payload.put("appointmentId", prescription.getAppointment() != null ? prescription.getAppointment().getId() : null);
        payload.put("medicineName", medicineName);
        payload.put("notes", safeText(prescription.getNotes()));
        payload.put("inventoryLow", matchingInventory != null && matchingInventory.getStock() <= matchingInventory.getLowStockThreshold());
        payload.put("suspicious", isSuspiciousPrescription(prescription));
        return payload;
    }

    private Map<String, String> defaultSettings() {
        Map<String, String> defaults = new LinkedHashMap<>();
        defaults.put("platformName", "AntiFSAD Health");
        defaults.put("contactEmail", "support@antifsad.local");
        defaults.put("supportPhone", "+91 90000 00000");
        defaults.put("workingHours", "09:00 - 18:00");
        defaults.put("termsText", "Platform terms managed by the administrator.");
        defaults.put("notifications.emailEnabled", "true");
        defaults.put("notifications.smsEnabled", "false");
        defaults.put("defaults.consultationMode", "VIDEO");
        return defaults;
    }
}
