package com.antifsad.backend.service;

import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import com.antifsad.backend.model.UserStatus;
import com.antifsad.backend.repository.AdminProfileRepository;
import com.antifsad.backend.repository.AppointmentRepository;
import com.antifsad.backend.repository.CallSessionRepository;
import com.antifsad.backend.repository.DoctorProfileRepository;
import com.antifsad.backend.repository.MedicineOrderRepository;
import com.antifsad.backend.repository.MedicalRecordRepository;
import com.antifsad.backend.repository.PatientProfileRepository;
import com.antifsad.backend.repository.PharmacistProfileRepository;
import com.antifsad.backend.repository.InventoryItemRepository;
import com.antifsad.backend.repository.PrescriptionRepository;
import com.antifsad.backend.repository.UserRepository;
import com.antifsad.backend.web.dto.UserCreateRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final ProfileProvisioningService profileProvisioningService;
    private final MedicineOrderRepository medicineOrderRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final CallSessionRepository callSessionRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PharmacistProfileRepository pharmacistProfileRepository;
    private final AdminProfileRepository adminProfileRepository;

    public UserService(UserRepository userRepository,
                       AppointmentRepository appointmentRepository,
                       PrescriptionRepository prescriptionRepository,
                       MedicalRecordRepository medicalRecordRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService,
                       ProfileProvisioningService profileProvisioningService,
                       MedicineOrderRepository medicineOrderRepository,
                       InventoryItemRepository inventoryItemRepository,
                       CallSessionRepository callSessionRepository,
                       PatientProfileRepository patientProfileRepository,
                       DoctorProfileRepository doctorProfileRepository,
                       PharmacistProfileRepository pharmacistProfileRepository,
                       AdminProfileRepository adminProfileRepository) {
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.profileProvisioningService = profileProvisioningService;
        this.medicineOrderRepository = medicineOrderRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.callSessionRepository = callSessionRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.pharmacistProfileRepository = pharmacistProfileRepository;
        this.adminProfileRepository = adminProfileRepository;
    }

    @Transactional
    public User createUser(UserCreateRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status(UserStatus.ACTIVE)
                .isApproved(role != Role.DOCTOR && role != Role.PHARMACIST)
                .build();
        User savedUser = userRepository.save(user);
        profileProvisioningService.ensureProfileExists(savedUser);
        auditLogService.log(savedUser, "ADMIN_CREATED_USER", "ADMIN", "INFO", "USER", savedUser.getId(), "User created by admin", java.util.Map.of("role", savedUser.getRole().name()));
        return savedUser;
    }

    @Transactional
    public User updateStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        inventoryItemRepository.deleteByPharmacist(user);
        medicineOrderRepository.deleteByPatient(user);
        medicineOrderRepository.deleteByPharmacist(user);
        callSessionRepository.findAll().stream()
                .filter(session -> (session.getCaller() != null && id.equals(session.getCaller().getId()))
                        || (session.getReceiver() != null && id.equals(session.getReceiver().getId()))
                        || (session.getEndedBy() != null && id.equals(session.getEndedBy().getId()))
                        || (session.getAppointment() != null && session.getAppointment().getDoctor() != null && id.equals(session.getAppointment().getDoctor().getId()))
                        || (session.getAppointment() != null && session.getAppointment().getPatient() != null && id.equals(session.getAppointment().getPatient().getId())))
                .forEach(callSessionRepository::delete);
        prescriptionRepository.deleteByPatient(user);
        prescriptionRepository.deleteByDoctor(user);
        appointmentRepository.deleteByPatient(user);
        appointmentRepository.deleteByDoctor(user);
        medicalRecordRepository.deleteByPatient(user);
        patientProfileRepository.findByUserId(id).ifPresent(patientProfileRepository::delete);
        doctorProfileRepository.findByUserId(id).ifPresent(doctorProfileRepository::delete);
        pharmacistProfileRepository.findByUserId(id).ifPresent(pharmacistProfileRepository::delete);
        adminProfileRepository.findByUserId(id).ifPresent(adminProfileRepository::delete);
        userRepository.delete(user);
    }
}
