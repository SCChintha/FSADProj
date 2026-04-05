package com.antifsad.backend.service;

import com.antifsad.backend.model.*;
import com.antifsad.backend.repository.AppointmentRepository;
import com.antifsad.backend.repository.PrescriptionRepository;
import com.antifsad.backend.repository.UserRepository;
import com.antifsad.backend.web.dto.PrescriptionItemRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               UserRepository userRepository,
                               AppointmentRepository appointmentRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<Prescription> getForPatient(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        return prescriptionRepository.findByPatient(patient);
    }

    public List<Prescription> getForDoctor(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        return prescriptionRepository.findByDoctor(doctor);
    }

    public List<Prescription> getAll() {
        return prescriptionRepository.findAll();
    }

    public List<Prescription> getForDoctorOnDate(Long doctorId, LocalDate date) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        return prescriptionRepository.findByDoctorAndDate(doctor, date);
    }

    @Transactional
    public Prescription createPrescription(Long doctorId,
                                           Long patientId,
                                           Long appointmentId,
                                           List<PrescriptionItemRequest> items,
                                           String notes) {
        User doctor = requireDoctor(doctorId);
        User patient = requirePatient(patientId);
        Appointment appointment = resolveAppointment(appointmentId, doctor, patient);

        Prescription prescription = Prescription.builder()
                .doctor(doctor)
                .patient(patient)
                .appointment(appointment)
                .date(LocalDate.now())
                .status(PrescriptionStatus.ISSUED)
                .notes(notes)
                .items(new ArrayList<>())
                .build();

        prescription.setItems(toPrescriptionItems(items, prescription));
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription updatePrescription(Long id,
                                           Long doctorId,
                                           Long patientId,
                                           Long appointmentId,
                                           List<PrescriptionItemRequest> items,
                                           String notes) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));
        User doctor = requireDoctor(doctorId);
        User patient = requirePatient(patientId);
        Appointment appointment = resolveAppointment(appointmentId, doctor, patient);

        prescription.setDoctor(doctor);
        prescription.setPatient(patient);
        prescription.setAppointment(appointment);
        prescription.setNotes(notes);
        prescription.getItems().clear();
        prescription.getItems().addAll(toPrescriptionItems(items, prescription));

        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription updateStatus(Long id, PrescriptionStatus status) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));
        prescription.setStatus(status);
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public void deletePrescription(Long id) {
        if (!prescriptionRepository.existsById(id)) {
            throw new IllegalArgumentException("Prescription not found");
        }
        prescriptionRepository.deleteById(id);
    }

    private User requireDoctor(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        if (doctor.getRole() != Role.DOCTOR) {
            throw new IllegalArgumentException("Selected user is not a doctor");
        }
        return doctor;
    }

    private User requirePatient(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        if (patient.getRole() != Role.PATIENT) {
            throw new IllegalArgumentException("Selected user is not a patient");
        }
        return patient;
    }

    private Appointment resolveAppointment(Long appointmentId, User doctor, User patient) {
        if (appointmentId == null) {
            return null;
        }
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (!doctor.getId().equals(appointment.getDoctor().getId()) || !patient.getId().equals(appointment.getPatient().getId())) {
            throw new IllegalArgumentException("Appointment does not belong to the supplied doctor and patient");
        }
        return appointment;
    }

    private List<PrescriptionItem> toPrescriptionItems(List<PrescriptionItemRequest> items, Prescription prescription) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("At least one prescription item is required");
        }
        return items.stream()
                .map(item -> PrescriptionItem.builder()
                        .prescription(prescription)
                        .medicineName(item.getMedicineName())
                        .dosage(item.getDosage())
                        .duration(item.getDuration())
                        .instructions(item.getInstructions())
                        .build())
                .toList();
    }
}
