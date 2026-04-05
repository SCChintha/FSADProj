//Chintha Sai Charan File access evvariki padthe vallaki radhu ra lwde
//ok na
package com.antifsad.backend.config;
import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.AppointmentStatus;
import com.antifsad.backend.model.AuditLog;
import com.antifsad.backend.model.Complaint;
import com.antifsad.backend.model.ComplaintStatus;
import com.antifsad.backend.model.ConsultationMode;
import com.antifsad.backend.model.InventoryItem;
import com.antifsad.backend.model.MedicalRecord;
import com.antifsad.backend.model.Prescription;
import com.antifsad.backend.model.PrescriptionItem;
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
import com.antifsad.backend.repository.PrescriptionRepository;
import com.antifsad.backend.repository.SystemSettingRepository;
import com.antifsad.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(InventoryItemRepository inventoryItemRepository,
                               AppointmentRepository appointmentRepository,
                               PrescriptionRepository prescriptionRepository,
                               MedicalRecordRepository medicalRecordRepository,
                               UserRepository userRepository,
                               ComplaintRepository complaintRepository,
                               AuditLogRepository auditLogRepository,
                               SystemSettingRepository systemSettingRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {
            if (inventoryItemRepository.count() == 0) {
                InventoryItem paracetamol = InventoryItem.builder()
                        .name("Paracetamol 500mg")
                        .stock(120)
                        .usage("Fever and mild pain relief")
                        .sideEffects("Nausea, rash (rare)")
                        .typicalDosage("500mg every 6 hours (max 4g/day)")
                        .lowStockThreshold(20)
                        .build();
                if (paracetamol != null) {
                    inventoryItemRepository.save(paracetamol);
                }

                InventoryItem ibuprofen = InventoryItem.builder()
                        .name("Ibuprofen 400mg")
                        .stock(18)
                        .usage("Pain, inflammation")
                        .sideEffects("Gastric irritation, dizziness")
                        .typicalDosage("400mg three times daily after food")
                        .lowStockThreshold(20)
                        .build();
                if (ibuprofen != null) {
                    inventoryItemRepository.save(ibuprofen);
                }

                InventoryItem amoxicillin = InventoryItem.builder()
                        .name("Amoxicillin 250mg")
                        .stock(6)
                        .usage("Bacterial infections")
                        .sideEffects("Diarrhea, allergic reactions")
                        .typicalDosage("250-500mg every 8 hours as prescribed")
                        .lowStockThreshold(20)
                        .build();
                if (amoxicillin != null) {
                    inventoryItemRepository.save(amoxicillin);
                }
            }

            if (userRepository.count() == 0) {
                User admin = User.builder()
                        .name("Admin User")
                        .email("admin@antifsad.local")
                        .passwordHash(passwordEncoder.encode("Password@123"))
                        .role(Role.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .build();
                if (admin != null) {
                    userRepository.save(admin);
                }

                User pharmacist = User.builder()
                        .name("Pharmacist User")
                        .email("pharmacist@antifsad.local")
                        .passwordHash(passwordEncoder.encode("Password@123"))
                        .role(Role.PHARMACIST)
                        .status(UserStatus.ACTIVE)
                        .isApproved(true)
                        .build();
                if (pharmacist != null) {
                    userRepository.save(pharmacist);
                }

                User doctor = User.builder()
                        .name("Doctor User")
                        .email("doctor@antifsad.local")
                        .passwordHash(passwordEncoder.encode("Password@123"))
                        .role(Role.DOCTOR)
                        .status(UserStatus.ACTIVE)
                        .isApproved(true)
                        .build();
                if (doctor != null) {
                    userRepository.save(doctor);
                }

                User patient = User.builder()
                        .name("Patient User")
                        .email("patient@antifsad.local")
                        .passwordHash(passwordEncoder.encode("Password@123"))
                        .role(Role.PATIENT)
                        .status(UserStatus.ACTIVE)
                        .build();
                if (patient != null) {
                    userRepository.save(patient);
                }

                User pendingDoctor = User.builder()
                        .name("Pending Doctor")
                        .email("pending.doctor@antifsad.local")
                        .passwordHash(passwordEncoder.encode("Password@123"))
                        .role(Role.DOCTOR)
                        .status(UserStatus.ACTIVE)
                        .isApproved(false)
                        .build();
                userRepository.save(pendingDoctor);

                User pendingPharmacist = User.builder()
                        .name("Pending Pharmacist")
                        .email("pending.pharmacist@antifsad.local")
                        .passwordHash(passwordEncoder.encode("Password@123"))
                        .role(Role.PHARMACIST)
                        .status(UserStatus.ACTIVE)
                        .isApproved(false)
                        .build();
                userRepository.save(pendingPharmacist);
            }

            User admin = userRepository.findByEmail("admin@antifsad.local").orElse(null);
            User doctor = userRepository.findByEmail("doctor@antifsad.local").orElse(null);
            User patient = userRepository.findByEmail("patient@antifsad.local").orElse(null);

            Appointment upcoming = null;
            Appointment completed = null;
            if (doctor != null && patient != null) {
                List<Appointment> appointments = appointmentRepository.findByDoctor(doctor);

                if (appointments.isEmpty()) {
                    Appointment appointmentToSave = Appointment.builder()
                            .patient(patient)
                            .doctor(doctor)
                            .date(LocalDate.now().plusDays(1))
                            .time(LocalTime.of(10, 30))
                            .mode(ConsultationMode.ONLINE)
                            .reason("Follow-up consultation for fever symptoms")
                            .status(AppointmentStatus.SCHEDULED)
                            .build();
                    if (appointmentToSave != null) {
                        Appointment upcomingTemp = appointmentRepository.save(appointmentToSave);
                        if (upcomingTemp != null) {
                            upcoming = upcomingTemp;
                        }
                    }

                    Appointment completedAppointment = Appointment.builder()
                            .patient(patient)
                            .doctor(doctor)
                            .date(LocalDate.now().minusDays(2))
                            .time(LocalTime.of(15, 0))
                            .mode(ConsultationMode.ONLINE)
                            .reason("General health review")
                            .status(AppointmentStatus.COMPLETED)
                            .build();
                    Appointment completedTemp = null;
                    if (completedAppointment != null) {
                        completedTemp = appointmentRepository.save(completedAppointment);
                    }
                    if (completedTemp != null) {
                        completed = completedTemp;
                    }
                } else {
                    upcoming = appointments.stream()
                            .filter(appointment -> appointment.getStatus() == AppointmentStatus.SCHEDULED)
                            .findFirst()
                            .orElse(appointments.get(0));
                    completed = appointments.stream()
                            .filter(appointment -> appointment.getStatus() == AppointmentStatus.COMPLETED)
                            .findFirst()
                            .orElse(appointments.get(0));
                }
            }

            if (prescriptionRepository.count() == 0 && doctor != null && patient != null) {
                Prescription issued = Prescription.builder()
                        .doctor(doctor)
                        .patient(patient)
                        .appointment(completed)
                        .date(LocalDate.now().minusDays(2))
                        .status(PrescriptionStatus.ISSUED)
                        .notes("Take medicine after food and stay hydrated.")
                        .build();

                PrescriptionItem item = PrescriptionItem.builder()
                        .prescription(issued)
                        .medicineName("Paracetamol 500mg")
                        .dosage("1 tablet twice daily")
                        .duration("5 days")
                        .instructions("After meals")
                        .build();
                issued.setItems(List.of(item));
                prescriptionRepository.save(issued);

                Prescription dispensed = Prescription.builder()
                        .doctor(doctor)
                        .patient(patient)
                        .appointment(upcoming)
                        .date(LocalDate.now().minusDays(10))
                        .status(PrescriptionStatus.DISPENSED)
                        .notes("Complete the course.")
                        .build();

                PrescriptionItem dispensedItem = PrescriptionItem.builder()
                        .prescription(dispensed)
                        .medicineName("Amoxicillin 250mg")
                        .dosage("1 capsule three times daily")
                        .duration("7 days")
                        .instructions("Do not skip doses")
                        .build();
                dispensed.setItems(List.of(dispensedItem));
                prescriptionRepository.save(dispensed);
            }

            if (medicalRecordRepository.count() == 0 && patient != null) {
                MedicalRecord bloodTest = MedicalRecord.builder()
                        .patient(patient)
                        .fileUrl("https://example.com/reports/blood-test.pdf")
                        .description("Blood test report")
                        .uploadedBy("patient")
                        .date(LocalDate.now().minusDays(15))
                        .build();
                if (bloodTest != null) {
                    medicalRecordRepository.save(bloodTest);
                }

                MedicalRecord checkupSummary = MedicalRecord.builder()
                        .patient(patient)
                        .fileUrl("https://example.com/reports/checkup-summary.pdf")
                        .description("Routine checkup summary")
                        .uploadedBy("admin")
                        .date(LocalDate.now().minusDays(5))
                        .build();
                if (checkupSummary != null) {
                    medicalRecordRepository.save(checkupSummary);
                }
            }

            if (complaintRepository.count() == 0 && admin != null && patient != null && doctor != null) {
                Complaint complaint = Complaint.builder()
                        .createdByUser(patient)
                        .targetUser(doctor)
                        .relatedAppointment(upcoming)
                        .category("Doctor conduct")
                        .subject("Late consultation response")
                        .description("Doctor joined the consultation late and the patient wants admin review.")
                        .status(ComplaintStatus.OPEN)
                        .assignedAdmin(admin)
                        .build();
                complaintRepository.save(complaint);

                Complaint resolvedComplaint = Complaint.builder()
                        .createdByUser(admin)
                        .targetUser(patient)
                        .relatedAppointment(completed)
                        .category("Support")
                        .subject("Profile correction request")
                        .description("Patient requested a correction in the uploaded profile details.")
                        .status(ComplaintStatus.RESOLVED)
                        .adminResponse("Resolved after updating the profile.")
                        .assignedAdmin(admin)
                        .resolvedAt(java.time.Instant.now().minusSeconds(3600))
                        .build();
                complaintRepository.save(resolvedComplaint);
            }

            if (systemSettingRepository.count() == 0) {
                systemSettingRepository.save(SystemSetting.builder().settingKey("platformName").settingValue("AntiFSAD Health").description("Platform display name").build());
                systemSettingRepository.save(SystemSetting.builder().settingKey("contactEmail").settingValue("support@antifsad.local").description("Support email").build());
                systemSettingRepository.save(SystemSetting.builder().settingKey("supportPhone").settingValue("+91 90000 00000").description("Support phone").build());
                systemSettingRepository.save(SystemSetting.builder().settingKey("workingHours").settingValue("09:00 - 18:00").description("Support hours").build());
                systemSettingRepository.save(SystemSetting.builder().settingKey("termsText").settingValue("Platform terms managed by the administrator.").description("Terms text").build());
            }

            if (auditLogRepository.count() == 0 && admin != null) {
                auditLogRepository.save(AuditLog.builder()
                        .actor(admin)
                        .action("LOGIN_SUCCESS")
                        .category("AUTH")
                        .severity("INFO")
                        .targetType("USER")
                        .targetId(admin.getId())
                        .details("Seeded login history for admin")
                        .build());
                if (doctor != null) {
                    auditLogRepository.save(AuditLog.builder()
                            .actor(admin)
                            .action("ADMIN_DOCTOR_APPROVAL")
                            .category("APPROVAL")
                            .severity("INFO")
                            .targetType("USER")
                            .targetId(doctor.getId())
                            .details("Seeded approval audit event")
                            .build());
                }
                auditLogRepository.save(AuditLog.builder()
                        .actor(admin)
                        .action("LOGIN_FAILED")
                        .category("AUTH")
                        .severity("WARN")
                        .targetType("USER")
                        .details("Seeded failed login attempt for dashboard review")
                        .build());
            }
        };
    }
}
