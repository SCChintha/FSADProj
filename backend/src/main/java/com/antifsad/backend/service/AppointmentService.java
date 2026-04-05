package com.antifsad.backend.service;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.AppointmentStatus;
import com.antifsad.backend.model.ConsultationMode;
import com.antifsad.backend.model.DoctorProfile;
import com.antifsad.backend.model.Prescription;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import com.antifsad.backend.model.UserStatus;
import com.antifsad.backend.repository.AppointmentRepository;
import com.antifsad.backend.repository.DoctorProfileRepository;
import com.antifsad.backend.repository.PrescriptionRepository;
import com.antifsad.backend.repository.UserRepository;
import com.antifsad.backend.web.dto.DoctorAvailabilityResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              PrescriptionRepository prescriptionRepository,
                              DoctorProfileRepository doctorProfileRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.doctorProfileRepository = doctorProfileRepository;
    }

    public List<Appointment> getForPatient(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        return appointmentRepository.findByPatient(patient);
    }

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getForDoctor(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        return appointmentRepository.findByDoctor(doctor);
    }

    public List<Appointment> getForDoctorOnDate(Long doctorId, LocalDate date) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        return appointmentRepository.findByDoctorAndDate(doctor, date);
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
    }

    @Transactional
    public Appointment createAppointment(Long patientId,
                                          Long doctorId,
                                          LocalDate date,
                                          LocalTime time,
                                          ConsultationMode mode,
                                          String reason) {
        User patient = requirePatient(patientId);
        User doctor = requireDoctor(doctorId);
        validateDoctorAvailability(doctor, date, time);

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .date(date)
                .time(time)
                .mode(mode)
                .reason(reason)
                .status(AppointmentStatus.SCHEDULED)
                .build();
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateAppointment(Long id,
                                         Long patientId,
                                         Long doctorId,
                                         LocalDate date,
                                         LocalTime time,
                                         ConsultationMode mode,
                                         String reason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        User patient = requirePatient(patientId);
        User doctor = requireDoctor(doctorId);
        validateDoctorAvailability(doctor, date, time);

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setMode(mode);
        appointment.setReason(reason);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Appointment id cannot be null");
        }
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        List<Prescription> prescriptions = prescriptionRepository.findByAppointment(appointment);
        for (Prescription prescription : prescriptions) {
            prescription.setAppointment(null);
        }
        appointmentRepository.delete(appointment);
    }

    public DoctorAvailabilityResponse getDoctorAvailability(Long doctorId, LocalDate date) {
        User doctor = requireDoctor(doctorId);
        DoctorProfile profile = doctorProfileRepository.findByUserId(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found"));
        List<String> slots = buildAvailableSlots(doctor, profile, date);
        return DoctorAvailabilityResponse.builder()
                .doctorId(doctorId)
                .date(date)
                .acceptingAppointments(Boolean.TRUE.equals(profile.getAcceptingAppointments()))
                .availableDays(splitCsv(profile.getAvailabilityDays()))
                .startTime(profile.getAvailabilityStartTime() == null ? null : profile.getAvailabilityStartTime().toString())
                .endTime(profile.getAvailabilityEndTime() == null ? null : profile.getAvailabilityEndTime().toString())
                .slotDurationMinutes(profile.getSlotDurationMinutes())
                .availableSlots(slots)
                .build();
    }

    private User requirePatient(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        if (patient.getRole() != Role.PATIENT) {
            throw new IllegalArgumentException("Selected user is not a patient");
        }
        return patient;
    }

    private User requireDoctor(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        if (doctor.getRole() != Role.DOCTOR) {
            throw new IllegalArgumentException("Selected user is not a doctor");
        }
        return doctor;
    }

    private void validateDoctorAvailability(User doctor, LocalDate date, LocalTime time) {
        if (!Boolean.TRUE.equals(doctor.getIsApproved()) || doctor.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException("Selected doctor is not available for booking");
        }
        DoctorProfile profile = doctorProfileRepository.findByUserId(doctor.getId()).orElse(null);
        if (profile == null || !Boolean.TRUE.equals(profile.getAcceptingAppointments())) {
            throw new IllegalArgumentException("Doctor is not accepting appointments");
        }
        List<String> slots = buildAvailableSlots(doctor, profile, date);
        String requestedSlot = time.format(DateTimeFormatter.ofPattern("HH:mm"));
        if (!slots.contains(requestedSlot)) {
            throw new IllegalArgumentException("Selected time slot is unavailable for this doctor");
        }
    }

    private List<String> buildAvailableSlots(User doctor, DoctorProfile profile, LocalDate date) {
        if (profile.getAvailabilityStartTime() == null
                || profile.getAvailabilityEndTime() == null
                || profile.getSlotDurationMinutes() == null
                || profile.getAvailabilityDays() == null
                || profile.getAvailabilityDays().isBlank()) {
            return List.of();
        }
        String currentDay = date.getDayOfWeek().name();
        List<String> allowedDays = splitCsv(profile.getAvailabilityDays());
        if (!allowedDays.contains(currentDay)) {
            return List.of();
        }

        List<Appointment> appointments = appointmentRepository.findByDoctorAndDate(doctor, date);
        List<String> bookedSlots = appointments.stream()
                .filter(item -> item.getStatus() != AppointmentStatus.CANCELLED)
                .map(item -> item.getTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .toList();

        List<String> slots = new java.util.ArrayList<>();
        LocalTime cursor = profile.getAvailabilityStartTime();
        while (!cursor.plusMinutes(profile.getSlotDurationMinutes()).isAfter(profile.getAvailabilityEndTime())) {
            String formatted = cursor.format(DateTimeFormatter.ofPattern("HH:mm"));
            if (!bookedSlots.contains(formatted)) {
                slots.add(formatted);
            }
            cursor = cursor.plusMinutes(profile.getSlotDurationMinutes());
        }
        return slots;
    }

    private List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(value.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .toList();
    }
}
