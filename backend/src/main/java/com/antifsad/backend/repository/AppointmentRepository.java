package com.antifsad.backend.repository;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Override
    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<Appointment> findAll();

    @Override
    @EntityGraph(attributePaths = {"patient", "doctor"})
    Optional<Appointment> findById(Long id);

    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<Appointment> findByPatient(User patient);

    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<Appointment> findByDoctor(User doctor);

    @EntityGraph(attributePaths = {"patient", "doctor"})
    List<Appointment> findByDoctorAndDate(User doctor, LocalDate date);

    void deleteByPatient(User patient);

    void deleteByDoctor(User doctor);
}
