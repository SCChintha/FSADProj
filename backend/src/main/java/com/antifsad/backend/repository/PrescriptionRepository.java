package com.antifsad.backend.repository;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.Prescription;
import com.antifsad.backend.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    @Override
    @EntityGraph(attributePaths = {"doctor", "patient", "appointment", "items"})
    List<Prescription> findAll();

    @EntityGraph(attributePaths = {"doctor", "patient", "appointment", "items"})
    List<Prescription> findByPatient(User patient);

    @EntityGraph(attributePaths = {"doctor", "patient", "appointment", "items"})
    List<Prescription> findByDoctor(User doctor);

    @EntityGraph(attributePaths = {"doctor", "patient", "appointment", "items"})
    List<Prescription> findByDoctorAndDate(User doctor, LocalDate date);

    @EntityGraph(attributePaths = {"doctor", "patient", "appointment", "items"})
    List<Prescription> findByAppointment(Appointment appointment);

    void deleteByPatient(User patient);
    void deleteByDoctor(User doctor);
}
