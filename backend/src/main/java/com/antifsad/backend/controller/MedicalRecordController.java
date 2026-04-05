package com.antifsad.backend.controller;

import com.antifsad.backend.model.MedicalRecord;
import com.antifsad.backend.service.MedicalRecordService;
import com.antifsad.backend.web.dto.MedicalRecordRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<List<MedicalRecord>> getForPatient(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(medicalRecordService.getForPatient(patientId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<MedicalRecord> create(@Valid @RequestBody MedicalRecordRequest request) {
        return ResponseEntity.ok(medicalRecordService.createRecord(
                request.getPatientId(),
                request.getFileUrl(),
                request.getDescription(),
                request.getUploadedBy()
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<MedicalRecord> update(@PathVariable("id") Long id,
                                                @Valid @RequestBody MedicalRecordRequest request) {
        return ResponseEntity.ok(medicalRecordService.updateRecord(
                id,
                request.getPatientId(),
                request.getFileUrl(),
                request.getDescription(),
                request.getUploadedBy()
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT','ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        medicalRecordService.deleteRecord(id);
        return ResponseEntity.noContent().build();
    }
}
