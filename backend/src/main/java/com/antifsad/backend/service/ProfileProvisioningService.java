package com.antifsad.backend.service;

import com.antifsad.backend.model.AdminProfile;
import com.antifsad.backend.model.DoctorProfile;
import com.antifsad.backend.model.PatientProfile;
import com.antifsad.backend.model.PharmacistProfile;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import com.antifsad.backend.repository.AdminProfileRepository;
import com.antifsad.backend.repository.DoctorProfileRepository;
import com.antifsad.backend.repository.PatientProfileRepository;
import com.antifsad.backend.repository.PharmacistProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileProvisioningService {

    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PharmacistProfileRepository pharmacistProfileRepository;
    private final AdminProfileRepository adminProfileRepository;

    public ProfileProvisioningService(PatientProfileRepository patientProfileRepository,
                                      DoctorProfileRepository doctorProfileRepository,
                                      PharmacistProfileRepository pharmacistProfileRepository,
                                      AdminProfileRepository adminProfileRepository) {
        this.patientProfileRepository = patientProfileRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.pharmacistProfileRepository = pharmacistProfileRepository;
        this.adminProfileRepository = adminProfileRepository;
    }

    @Transactional
    public void ensureProfileExists(User user) {
        Role role = user.getRole();
        switch (role) {
            case PATIENT -> patientProfileRepository.findByUserId(user.getId())
                    .orElseGet(() -> patientProfileRepository.save(PatientProfile.builder().user(user).build()));
            case DOCTOR -> doctorProfileRepository.findByUserId(user.getId())
                    .orElseGet(() -> doctorProfileRepository.save(DoctorProfile.builder().user(user).build()));
            case PHARMACIST -> pharmacistProfileRepository.findByUserId(user.getId())
                    .orElseGet(() -> pharmacistProfileRepository.save(PharmacistProfile.builder().user(user).build()));
            case ADMIN -> adminProfileRepository.findByUserId(user.getId())
                    .orElseGet(() -> adminProfileRepository.save(AdminProfile.builder().user(user).build()));
        }
    }
}
