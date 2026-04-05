package com.antifsad.backend.repository;

import com.antifsad.backend.model.MedicalRecord;
import com.antifsad.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatient(User patient);
    void deleteByPatient(User patient);
}
