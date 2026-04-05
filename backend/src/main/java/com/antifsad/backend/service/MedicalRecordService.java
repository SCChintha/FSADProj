package com.antifsad.backend.service;

import com.antifsad.backend.model.MedicalRecord;
import com.antifsad.backend.model.User;
import com.antifsad.backend.repository.MedicalRecordRepository;
import com.antifsad.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                UserRepository userRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
    }

    public List<MedicalRecord> getForPatient(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        return medicalRecordRepository.findByPatient(patient);
    }

    @Transactional
    public MedicalRecord createRecord(Long patientId, String fileUrl, String description, String uploadedBy) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .fileUrl(fileUrl)
                .description(description)
                .uploadedBy(uploadedBy)
                .date(LocalDate.now())
                .build();

        return medicalRecordRepository.save(record);
    }

    @Transactional
    public MedicalRecord updateRecord(Long id, Long patientId, String fileUrl, String description, String uploadedBy) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Medical record not found"));
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        record.setPatient(patient);
        record.setFileUrl(fileUrl);
        record.setDescription(description);
        record.setUploadedBy(uploadedBy);
        return medicalRecordRepository.save(record);
    }

    @Transactional
    public void deleteRecord(Long id) {
        if (!medicalRecordRepository.existsById(id)) {
            throw new IllegalArgumentException("Medical record not found");
        }
        medicalRecordRepository.deleteById(id);
    }
}
