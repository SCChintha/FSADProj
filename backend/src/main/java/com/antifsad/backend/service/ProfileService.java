package com.antifsad.backend.service;

import com.antifsad.backend.dto.*;
import com.antifsad.backend.model.*;
import com.antifsad.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.context.SecurityContextHolder;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Transactional
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private PharmacistProfileRepository pharmacistProfileRepository;

    @Autowired
    private AdminProfileRepository adminProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Validator validator;

    // Retrieve currently logged-in user email
    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public Object getMyProfile() {
        String email = getCurrentUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return getProfileByUser(user);
    }

    public Object getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return getProfileByUser(user);
    }

    private Object getProfileByUser(User user) {
        switch (user.getRole()) {
            case PATIENT:
                return getPatientProfile(user);
            case DOCTOR:
                return getDoctorProfile(user);
            case PHARMACIST:
                return getPharmacistProfile(user);
            case ADMIN:
                return getAdminProfile(user);
            default:
                throw new RuntimeException("Invalid role");
        }
    }

    private PatientProfileResponse getPatientProfile(User user) {
        PatientProfile profile = patientProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    PatientProfile p = new PatientProfile();
                    p.setUser(user);
                    return patientProfileRepository.save(p);
                });

        PatientProfileResponse res = new PatientProfileResponse();
        res.setUserId(user.getId());
        res.setFirstName(profile.getFirstName());
        res.setLastName(profile.getLastName());
        res.setEmail(user.getEmail());
        res.setPhone(firstNonBlank(profile.getPhone(), user.getPhone()));
        res.setProfilePhotoUrl(user.getProfilePhotoUrl());
        res.setRole(user.getRole().name());
        res.setIsVerified(true);
        res.setCreatedAt(user.getCreatedAt());

        res.setDateOfBirth(profile.getDateOfBirth());
        res.setGender(profile.getGender());
        res.setBloodGroup(profile.getBloodGroup());
        res.setHeightCm(profile.getHeightCm());
        res.setWeightKg(profile.getWeightKg());

        if (profile.getAllergies() != null && !profile.getAllergies().isBlank()) {
            res.setAllergiesList(Arrays.asList(profile.getAllergies().split(",")));
        } else {
            res.setAllergiesList(new ArrayList<>());
        }
        if (profile.getChronicConditions() != null && !profile.getChronicConditions().isBlank()) {
            res.setChronicConditionsList(Arrays.asList(profile.getChronicConditions().split(",")));
        } else {
            res.setChronicConditionsList(new ArrayList<>());
        }
        if (profile.getCurrentMedications() != null && !profile.getCurrentMedications().isBlank()) {
            res.setCurrentMedicationsList(Arrays.asList(profile.getCurrentMedications().split(",")));
        } else {
            res.setCurrentMedicationsList(new ArrayList<>());
        }

        res.setEmergencyContactName(profile.getEmergencyContactName());
        res.setEmergencyContactPhone(profile.getEmergencyContactPhone());
        res.setEmergencyContactRelation(profile.getEmergencyContactRelation());

        res.setAddressLine1(profile.getAddressLine1());
        res.setAddressLine2(profile.getAddressLine2());
        res.setCity(profile.getCity());
        res.setState(profile.getState());
        res.setPincode(profile.getPincode());

        res.setInsuranceProvider(profile.getInsuranceProvider());
        res.setInsurancePolicyNumber(profile.getInsurancePolicyNumber());

        populatePatientCompletion(profile, res);
        
        return res;
    }

    private DoctorProfileResponse getDoctorProfile(User user) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    DoctorProfile p = new DoctorProfile();
                    p.setUser(user);
                    p.setAvailabilityStartTime(LocalTime.of(9, 0));
                    p.setAvailabilityEndTime(LocalTime.of(17, 0));
                    p.setAvailabilityDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY");
                    p.setSlotDurationMinutes(30);
                    p.setAcceptingAppointments(Boolean.TRUE);
                    return doctorProfileRepository.save(p);
                });

        if (profile.getAvailabilityStartTime() == null) profile.setAvailabilityStartTime(LocalTime.of(9, 0));
        if (profile.getAvailabilityEndTime() == null) profile.setAvailabilityEndTime(LocalTime.of(17, 0));
        if (profile.getAvailabilityDays() == null || profile.getAvailabilityDays().isBlank()) profile.setAvailabilityDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY");
        if (profile.getSlotDurationMinutes() == null) profile.setSlotDurationMinutes(30);
        if (profile.getAcceptingAppointments() == null) profile.setAcceptingAppointments(Boolean.TRUE);
        doctorProfileRepository.save(profile);

        DoctorProfileResponse res = new DoctorProfileResponse();
        res.setUserId(user.getId());
        res.setFirstName(profile.getFirstName());
        res.setLastName(profile.getLastName());
        res.setEmail(user.getEmail());
        res.setPhone(firstNonBlank(profile.getPhone(), user.getPhone()));
        res.setProfilePhotoUrl(user.getProfilePhotoUrl());
        res.setRole(user.getRole().name());
        res.setIsVerified(true);
        res.setCreatedAt(user.getCreatedAt());

        res.setSpecialization(profile.getSpecialization());
        res.setSpecializationLabel(profile.getSpecialization());
        res.setQualification(profile.getQualification());
        res.setYearsOfExperience(profile.getYearsOfExperience());
        res.setConsultationFee(profile.getConsultationFee());
        res.setHospitalName(profile.getHospitalName());
        res.setHospitalAddress(profile.getHospitalAddress());
        res.setBio(profile.getBio());

        if (profile.getLanguagesSpoken() != null && !profile.getLanguagesSpoken().isBlank()) {
            res.setLanguagesSpokenList(Arrays.asList(profile.getLanguagesSpoken().split(",")));
        } else {
            res.setLanguagesSpokenList(new ArrayList<>());
        }

        res.setLicenseNumber(profile.getLicenseNumber());
        res.setLicenseExpiryDate(profile.getLicenseExpiryDate());
        res.setLicenseStatus(profile.getLicenseStatus());
        res.setDegreeDocumentViewType(profile.getDegreeDocumentViewType());
        res.setDegreeCertificateUrl(profile.getDegreeCertificateUrl());
        res.setDegreeDocumentDriveLink(profile.getDegreeDocumentDriveLink());
        res.setLicenseDocumentViewType(profile.getLicenseDocumentViewType());
        res.setLicenseDocumentUrl(profile.getLicenseDocumentUrl());
        res.setLicenseDocumentDriveLink(profile.getLicenseDocumentDriveLink());
        res.setAvailabilityStartTime(profile.getAvailabilityStartTime());
        res.setAvailabilityEndTime(profile.getAvailabilityEndTime());
        res.setAvailabilityDaysList(splitList(profile.getAvailabilityDays()));
        res.setSlotDurationMinutes(profile.getSlotDurationMinutes());
        res.setAcceptingAppointments(Boolean.TRUE.equals(profile.getAcceptingAppointments()));

        res.setIsApproved(user.getIsApproved() != null ? user.getIsApproved() : false);
        res.setAverageRating(profile.getAverageRating());
        res.setTotalReviews(profile.getTotalReviews());
        res.setTotalConsultations(profile.getTotalConsultations());

        populateDoctorCompletion(profile, res);
        return res;
    }

    private PharmacistProfileResponse getPharmacistProfile(User user) {
        PharmacistProfile profile = pharmacistProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    PharmacistProfile p = new PharmacistProfile();
                    p.setUser(user);
                    return pharmacistProfileRepository.save(p);
                });

        PharmacistProfileResponse res = new PharmacistProfileResponse();
        res.setUserId(user.getId());
        res.setFirstName(profile.getFirstName());
        res.setLastName(profile.getLastName());
        res.setEmail(user.getEmail());
        res.setPhone(firstNonBlank(profile.getPhone(), user.getPhone()));
        res.setProfilePhotoUrl(user.getProfilePhotoUrl());
        res.setRole(user.getRole().name());
        res.setIsVerified(true);
        res.setCreatedAt(user.getCreatedAt());

        res.setPharmacyName(profile.getPharmacyName());
        res.setPharmacyAddressLine1(profile.getPharmacyAddressLine1());
        res.setPharmacyAddressLine2(profile.getPharmacyAddressLine2());
        res.setPharmacyCity(profile.getPharmacyCity());
        res.setPharmacyState(profile.getPharmacyState());
        res.setPharmacyPincode(profile.getPharmacyPincode());
        res.setPharmacyPhone(profile.getPharmacyPhone());

        res.setWorkingHoursStart(profile.getWorkingHoursStart());
        res.setWorkingHoursEnd(profile.getWorkingHoursEnd());
        
        if (profile.getWorkingDays() != null && !profile.getWorkingDays().isBlank()) {
            res.setWorkingDaysList(Arrays.asList(profile.getWorkingDays().split(",")));
        } else {
            res.setWorkingDaysList(new ArrayList<>());
        }

        res.setLicenseNumber(profile.getLicenseNumber());
        res.setLicenseExpiryDate(profile.getLicenseExpiryDate());
        res.setLicenseStatus(profile.getLicenseStatus());
        res.setQualification(profile.getQualification());
        res.setYearsOfExperience(profile.getYearsOfExperience());
        res.setLicenseDocumentViewType(profile.getLicenseDocumentViewType());
        res.setLicenseDocumentUrl(profile.getLicenseDocumentUrl());
        res.setLicenseDocumentDriveLink(profile.getLicenseDocumentDriveLink());

        populatePharmacistCompletion(profile, res);
        return res;
    }

    private AdminProfileResponse getAdminProfile(User user) {
        AdminProfile profile = adminProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    AdminProfile p = new AdminProfile();
                    p.setUser(user);
                    return adminProfileRepository.save(p);
                });

        AdminProfileResponse res = new AdminProfileResponse();
        res.setUserId(user.getId());
        res.setFirstName(profile.getFirstName());
        res.setLastName(profile.getLastName());
        res.setEmail(user.getEmail());
        res.setPhone(profile.getPhone());
        res.setProfilePhotoUrl(user.getProfilePhotoUrl());
        res.setRole(user.getRole().name());
        res.setIsVerified(true);
        res.setCreatedAt(user.getCreatedAt());

        res.setEmployeeId(profile.getEmployeeId() != null ? profile.getEmployeeId() : "EMP-" + user.getId());
        res.setDepartment(profile.getDepartment());
        res.setDesignation(profile.getDesignation());
        res.setAccessLevel(profile.getAccessLevel() != null ? profile.getAccessLevel() : "Level 1");
        
        res.setTwoFactorEnabled(profile.getTwoFactorEnabled() != null ? profile.getTwoFactorEnabled() : false);
        res.setLastPasswordChange(profile.getLastPasswordChange());
        res.setLastLogin(user.getLastLoginAt());

        return res;
    }

    public Object updateMyProfile(Map<String, Object> req) {
        String email = getCurrentUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return updateProfileByUser(user, req);
    }

    public Object updateProfileByUserId(Long userId, Map<String, Object> req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Admin updates status/isApproved from request body too, as requested:
        if (req.containsKey("status")) {
            user.setStatus(UserStatus.valueOf(req.get("status").toString().toUpperCase()));
        }
        if (req.containsKey("isApproved")) {
            user.setIsApproved(Boolean.parseBoolean(req.get("isApproved").toString()));
        }
        userRepository.save(user);

        return updateProfileByUser(user, req);
    }

    private Object updateProfileByUser(User user, Map<String, Object> req) {
        switch (user.getRole()) {
            case PATIENT:
                PatientProfileUpdateRequest patientRequest = objectMapper.convertValue(req, PatientProfileUpdateRequest.class);
                validateRequest(patientRequest);
                return updatePatientProfile(patientRequest, user);
            case DOCTOR:
                DoctorProfileUpdateRequest doctorRequest = objectMapper.convertValue(req, DoctorProfileUpdateRequest.class);
                validateRequest(doctorRequest);
                return updateDoctorProfile(doctorRequest, user);
            case PHARMACIST:
                PharmacistProfileUpdateRequest pharmacistRequest = objectMapper.convertValue(req, PharmacistProfileUpdateRequest.class);
                validateRequest(pharmacistRequest);
                return updatePharmacistProfile(pharmacistRequest, user);
            case ADMIN:
                AdminProfileUpdateRequest adminRequest = objectMapper.convertValue(req, AdminProfileUpdateRequest.class);
                validateRequest(adminRequest);
                return updateAdminProfile(adminRequest, user);
            default:
                throw new RuntimeException("Invalid role");
        }
    }

    public PatientProfileResponse updatePatientProfile(PatientProfileUpdateRequest req, User user) {
        PatientProfile profile = patientProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    PatientProfile p = new PatientProfile();
                    p.setUser(user);
                    return p;
                });

        if (req.getFirstName() != null) profile.setFirstName(req.getFirstName());
        if (req.getLastName() != null) profile.setLastName(req.getLastName());
        if (req.getPhone() != null) profile.setPhone(req.getPhone());
        if (req.getDateOfBirth() != null) profile.setDateOfBirth(req.getDateOfBirth());
        if (req.getGender() != null) profile.setGender(req.getGender());
        if (req.getBloodGroup() != null) profile.setBloodGroup(req.getBloodGroup());
        if (req.getHeightCm() != null) profile.setHeightCm(req.getHeightCm());
        if (req.getWeightKg() != null) profile.setWeightKg(req.getWeightKg());
        if (req.getAllergies() != null) profile.setAllergies(req.getAllergies());
        if (req.getChronicConditions() != null) profile.setChronicConditions(req.getChronicConditions());
        if (req.getCurrentMedications() != null) profile.setCurrentMedications(req.getCurrentMedications());
        if (req.getEmergencyContactName() != null) profile.setEmergencyContactName(req.getEmergencyContactName());
        if (req.getEmergencyContactPhone() != null) profile.setEmergencyContactPhone(req.getEmergencyContactPhone());
        if (req.getEmergencyContactRelation() != null) profile.setEmergencyContactRelation(req.getEmergencyContactRelation());
        if (req.getAddressLine1() != null) profile.setAddressLine1(req.getAddressLine1());
        if (req.getAddressLine2() != null) profile.setAddressLine2(req.getAddressLine2());
        if (req.getCity() != null) profile.setCity(req.getCity());
        if (req.getState() != null) profile.setState(req.getState());
        if (req.getPincode() != null) profile.setPincode(req.getPincode());
        if (req.getInsuranceProvider() != null) profile.setInsuranceProvider(req.getInsuranceProvider());
        if (req.getInsurancePolicyNumber() != null) profile.setInsurancePolicyNumber(req.getInsurancePolicyNumber());
        syncCommonPhone(user, profile.getPhone());

        patientProfileRepository.save(profile);
        userRepository.save(user);
        return getPatientProfile(user);
    }

    public DoctorProfileResponse updateDoctorProfile(DoctorProfileUpdateRequest req, User user) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    DoctorProfile p = new DoctorProfile();
                    p.setUser(user);
                    return p;
                });

        if (req.getFirstName() != null) profile.setFirstName(req.getFirstName());
        if (req.getLastName() != null) profile.setLastName(req.getLastName());
        if (req.getPhone() != null) profile.setPhone(req.getPhone());
        if (req.getSpecialization() != null) profile.setSpecialization(req.getSpecialization());
        if (req.getQualification() != null) profile.setQualification(req.getQualification());
        if (req.getYearsOfExperience() != null) profile.setYearsOfExperience(req.getYearsOfExperience());
        if (req.getConsultationFee() != null) profile.setConsultationFee(req.getConsultationFee());
        if (req.getHospitalName() != null) profile.setHospitalName(req.getHospitalName());
        if (req.getHospitalAddress() != null) profile.setHospitalAddress(req.getHospitalAddress());
        if (req.getBio() != null) profile.setBio(req.getBio());
        if (req.getLanguagesSpoken() != null) profile.setLanguagesSpoken(req.getLanguagesSpoken());
        if (req.getLicenseNumber() != null) profile.setLicenseNumber(req.getLicenseNumber());
        if (req.getLicenseExpiryDate() != null) profile.setLicenseExpiryDate(req.getLicenseExpiryDate());
        if (req.getLicenseStatus() != null) profile.setLicenseStatus(req.getLicenseStatus());
        if (req.getDegreeCertificateUrl() != null) profile.setDegreeCertificateUrl(req.getDegreeCertificateUrl());
        if (req.getDegreeDocumentDriveLink() != null) {
            validateDriveLink(req.getDegreeDocumentDriveLink());
            profile.setDegreeDocumentDriveLink(req.getDegreeDocumentDriveLink());
        }
        if (req.getDegreeDocumentViewType() != null) profile.setDegreeDocumentViewType(req.getDegreeDocumentViewType());
        if (req.getLicenseDocumentUrl() != null) profile.setLicenseDocumentUrl(req.getLicenseDocumentUrl());
        if (req.getLicenseDocumentDriveLink() != null) {
            validateDriveLink(req.getLicenseDocumentDriveLink());
            profile.setLicenseDocumentDriveLink(req.getLicenseDocumentDriveLink());
        }
        if (req.getLicenseDocumentViewType() != null) profile.setLicenseDocumentViewType(req.getLicenseDocumentViewType());
        ensureDocumentLinkPresent(profile.getDegreeDocumentViewType(), profile.getDegreeDocumentDriveLink(), "Degree document");
        ensureDocumentLinkPresent(profile.getLicenseDocumentViewType(), profile.getLicenseDocumentDriveLink(), "License document");
        if (req.getAvailabilityStartTime() != null) profile.setAvailabilityStartTime(req.getAvailabilityStartTime());
        if (req.getAvailabilityEndTime() != null) profile.setAvailabilityEndTime(req.getAvailabilityEndTime());
        if (req.getAvailabilityDays() != null) profile.setAvailabilityDays(req.getAvailabilityDays());
        if (req.getSlotDurationMinutes() != null) profile.setSlotDurationMinutes(req.getSlotDurationMinutes());
        if (req.getAcceptingAppointments() != null) profile.setAcceptingAppointments(req.getAcceptingAppointments());
        validateAvailability(profile.getAvailabilityStartTime(), profile.getAvailabilityEndTime(), profile.getAvailabilityDays(), profile.getSlotDurationMinutes());
        syncCommonPhone(user, profile.getPhone());

        doctorProfileRepository.save(profile);
        userRepository.save(user);
        return getDoctorProfile(user);
    }

    public PharmacistProfileResponse updatePharmacistProfile(PharmacistProfileUpdateRequest req, User user) {
        PharmacistProfile profile = pharmacistProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    PharmacistProfile p = new PharmacistProfile();
                    p.setUser(user);
                    return p;
                });

        if (req.getFirstName() != null) profile.setFirstName(req.getFirstName());
        if (req.getLastName() != null) profile.setLastName(req.getLastName());
        if (req.getPhone() != null) profile.setPhone(req.getPhone());
        if (req.getPharmacyName() != null) profile.setPharmacyName(req.getPharmacyName());
        if (req.getPharmacyAddressLine1() != null) profile.setPharmacyAddressLine1(req.getPharmacyAddressLine1());
        if (req.getPharmacyAddressLine2() != null) profile.setPharmacyAddressLine2(req.getPharmacyAddressLine2());
        if (req.getPharmacyCity() != null) profile.setPharmacyCity(req.getPharmacyCity());
        if (req.getPharmacyState() != null) profile.setPharmacyState(req.getPharmacyState());
        if (req.getPharmacyPincode() != null) profile.setPharmacyPincode(req.getPharmacyPincode());
        if (req.getPharmacyPhone() != null) profile.setPharmacyPhone(req.getPharmacyPhone());
        if (req.getWorkingHoursStart() != null) profile.setWorkingHoursStart(req.getWorkingHoursStart());
        if (req.getWorkingHoursEnd() != null) profile.setWorkingHoursEnd(req.getWorkingHoursEnd());
        if (req.getWorkingDays() != null) profile.setWorkingDays(req.getWorkingDays());
        if (req.getQualification() != null) profile.setQualification(req.getQualification());
        if (req.getYearsOfExperience() != null) profile.setYearsOfExperience(req.getYearsOfExperience());
        if (req.getLicenseNumber() != null) profile.setLicenseNumber(req.getLicenseNumber());
        if (req.getLicenseExpiryDate() != null) profile.setLicenseExpiryDate(req.getLicenseExpiryDate());
        if (req.getLicenseStatus() != null) profile.setLicenseStatus(req.getLicenseStatus());
        if (req.getLicenseDocumentUrl() != null) profile.setLicenseDocumentUrl(req.getLicenseDocumentUrl());
        if (req.getLicenseDocumentDriveLink() != null) {
            validateDriveLink(req.getLicenseDocumentDriveLink());
            profile.setLicenseDocumentDriveLink(req.getLicenseDocumentDriveLink());
        }
        if (req.getLicenseDocumentViewType() != null) profile.setLicenseDocumentViewType(req.getLicenseDocumentViewType());
        ensureDocumentLinkPresent(profile.getLicenseDocumentViewType(), profile.getLicenseDocumentDriveLink(), "License document");
        validateWorkingHours(profile.getWorkingHoursStart(), profile.getWorkingHoursEnd());
        syncCommonPhone(user, profile.getPhone());

        pharmacistProfileRepository.save(profile);
        userRepository.save(user);
        return getPharmacistProfile(user);
    }

    public AdminProfileResponse updateAdminProfile(AdminProfileUpdateRequest req, User user) {
        AdminProfile profile = adminProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    AdminProfile p = new AdminProfile();
                    p.setUser(user);
                    return p;
                });

        if (req.getFirstName() != null) profile.setFirstName(req.getFirstName());
        if (req.getLastName() != null) profile.setLastName(req.getLastName());
        if (req.getPhone() != null) profile.setPhone(req.getPhone());
        if (req.getDepartment() != null) profile.setDepartment(req.getDepartment());
        if (req.getDesignation() != null) profile.setDesignation(req.getDesignation());
        syncCommonPhone(user, profile.getPhone());

        adminProfileRepository.save(profile);
        userRepository.save(user);
        return getAdminProfile(user);
    }

    @Autowired
    private com.cloudinary.Cloudinary cloudinary;

    public String uploadProfilePhoto(MultipartFile file) {
        String email = getCurrentUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), com.cloudinary.utils.ObjectUtils.asMap(
                    "folder", "mediconnect/profiles/" + user.getId(),
                    "resource_type", "image"
            ));
            String url = uploadResult.get("secure_url").toString();
            user.setProfilePhotoUrl(url);
            userRepository.save(user);
            return url;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload photo", e);
        }
    }

    public com.antifsad.backend.web.dto.DocumentUploadResponse uploadProfileDocument(MultipartFile file, String documentKey) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Document file is required");
        }
        User user = userRepository.findByEmail(getCurrentUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), com.cloudinary.utils.ObjectUtils.asMap(
                    "folder", "mediconnect/documents/" + user.getId(),
                    "resource_type", "auto"
            ));
            String url = uploadResult.get("secure_url").toString();
            applyDocumentUrl(user, documentKey, url);
            return com.antifsad.backend.web.dto.DocumentUploadResponse.builder()
                    .documentKey(documentKey)
                    .documentUrl(url)
                    .viewType(DocumentViewType.UPLOAD)
                    .build();
        } catch (Exception exception) {
            throw new RuntimeException("Failed to upload document", exception);
        }
    }

    public void deleteProfileDocument(String documentKey) {
        User user = userRepository.findByEmail(getCurrentUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        clearDocument(user, documentKey);
    }

    public void changePassword(String currentPassword, String newPassword, String confirmNewPassword) {
        String email = getCurrentUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (!newPassword.equals(confirmNewPassword)) {
            throw new RuntimeException("New passwords do not match");
        }
        if (newPassword.length() < 8
                || !Pattern.compile("[A-Z]").matcher(newPassword).find()
                || !Pattern.compile("[a-z]").matcher(newPassword).find()
                || !Pattern.compile("\\d").matcher(newPassword).find()
                || !Pattern.compile("[^A-Za-z0-9]").matcher(newPassword).find()) {
            throw new RuntimeException("New password must be at least 8 characters and include upper, lower, number, and special character");
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new RuntimeException("New password must be different from the current password");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public Map<String, Object> getProfileCompletion() {
        String email = getCurrentUsername();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        int percent = 0;
        List<String> missingFields = new ArrayList<>();
        
        switch (user.getRole()) {
            case PATIENT:
                PatientProfileResponse pr = new PatientProfileResponse();
                patientProfileRepository.findByUserId(user.getId()).ifPresent(p -> populatePatientCompletion(p, pr));
                percent = pr.getProfileCompletionPercent() != null ? pr.getProfileCompletionPercent() : 0;
                missingFields = pr.getMissingFields() != null ? pr.getMissingFields() : new ArrayList<>();
                break;
            case DOCTOR:
                DoctorProfileResponse dr = new DoctorProfileResponse();
                doctorProfileRepository.findByUserId(user.getId()).ifPresent(p -> populateDoctorCompletion(p, dr));
                percent = dr.getProfileCompletionPercent() != null ? dr.getProfileCompletionPercent() : 0;
                missingFields = dr.getMissingFields() != null ? dr.getMissingFields() : new ArrayList<>();
                break;
            case PHARMACIST:
                PharmacistProfileResponse phr = new PharmacistProfileResponse();
                pharmacistProfileRepository.findByUserId(user.getId()).ifPresent(p -> populatePharmacistCompletion(p, phr));
                percent = phr.getProfileCompletionPercent() != null ? phr.getProfileCompletionPercent() : 0;
                missingFields = phr.getMissingFields() != null ? phr.getMissingFields() : new ArrayList<>();
                break;
            case ADMIN:
                percent = 100;
                break;
        }
        
        return Map.of(
            "profileCompletionPercent", percent,
            "missingFields", missingFields
        );
    }

    public DoctorProfileResponse getPublicDoctorProfile(Long doctorId) {
        User user = userRepository.findById(doctorId).orElseThrow(() -> new RuntimeException("Doctor not found"));
        if (user.getRole() != Role.DOCTOR) {
            throw new RuntimeException("User is not a doctor");
        }
        return getDoctorProfile(user);
    }

    private void populatePatientCompletion(PatientProfile p, PatientProfileResponse res) {
        List<String> missing = new ArrayList<>();
        if (p.getFirstName() == null || p.getFirstName().isBlank()) missing.add("First Name");
        if (p.getLastName() == null || p.getLastName().isBlank()) missing.add("Last Name");
        if (p.getPhone() == null || p.getPhone().isBlank()) missing.add("Phone");
        if (p.getDateOfBirth() == null) missing.add("Date of Birth");
        if (p.getGender() == null || p.getGender().isBlank()) missing.add("Gender");
        if (p.getBloodGroup() == null || p.getBloodGroup().isBlank()) missing.add("Blood Group");
        if (p.getHeightCm() == null) missing.add("Height");
        if (p.getWeightKg() == null) missing.add("Weight");
        if (p.getEmergencyContactName() == null || p.getEmergencyContactName().isBlank()) missing.add("Emergency Contact Name");
        if (p.getEmergencyContactPhone() == null || p.getEmergencyContactPhone().isBlank()) missing.add("Emergency Contact Phone");
        if (p.getCity() == null || p.getCity().isBlank()) missing.add("City");
        if (p.getState() == null || p.getState().isBlank()) missing.add("State");
        if (p.getPincode() == null || p.getPincode().isBlank()) missing.add("Pincode");

        int total = 13;
        int filled = total - missing.size();
        res.setProfileCompletionPercent((int) Math.round((double) filled / total * 100));
        res.setMissingFields(missing);
    }

    private void populateDoctorCompletion(DoctorProfile p, DoctorProfileResponse res) {
        List<String> missing = new ArrayList<>();
        if (p.getFirstName() == null || p.getFirstName().isBlank()) missing.add("First Name");
        if (p.getLastName() == null || p.getLastName().isBlank()) missing.add("Last Name");
        if (p.getPhone() == null || p.getPhone().isBlank()) missing.add("Phone");
        if (p.getSpecialization() == null || p.getSpecialization().isBlank()) missing.add("Specialization");
        if (p.getLicenseNumber() == null || p.getLicenseNumber().isBlank()) missing.add("License Number");
        if (p.getLicenseExpiryDate() == null) missing.add("License Expiry Date");
        if (p.getQualification() == null || p.getQualification().isBlank()) missing.add("Qualification");
        if (p.getYearsOfExperience() == null) missing.add("Years of Experience");
        if (p.getConsultationFee() == null) missing.add("Consultation Fee");
        if (p.getHospitalName() == null || p.getHospitalName().isBlank()) missing.add("Hospital Name");
        if (p.getBio() == null || p.getBio().isBlank()) missing.add("Bio");
        if (p.getAvailabilityStartTime() == null) missing.add("Availability Start Time");
        if (p.getAvailabilityEndTime() == null) missing.add("Availability End Time");
        if (p.getAvailabilityDays() == null || p.getAvailabilityDays().isBlank()) missing.add("Availability Days");
        if (p.getSlotDurationMinutes() == null) missing.add("Slot Duration");

        int total = 15;
        int filled = total - missing.size();
        res.setProfileCompletionPercent((int) Math.round((double) filled / total * 100));
        res.setMissingFields(missing);
    }

    private void populatePharmacistCompletion(PharmacistProfile p, PharmacistProfileResponse res) {
        List<String> missing = new ArrayList<>();
        if (p.getFirstName() == null || p.getFirstName().isBlank()) missing.add("First Name");
        if (p.getLastName() == null || p.getLastName().isBlank()) missing.add("Last Name");
        if (p.getPhone() == null || p.getPhone().isBlank()) missing.add("Phone");
        if (p.getPharmacyName() == null || p.getPharmacyName().isBlank()) missing.add("Pharmacy Name");
        if (p.getLicenseNumber() == null || p.getLicenseNumber().isBlank()) missing.add("License Number");
        if (p.getLicenseExpiryDate() == null) missing.add("License Expiry Date");
        if (p.getQualification() == null || p.getQualification().isBlank()) missing.add("Qualification");
        if (p.getPharmacyCity() == null || p.getPharmacyCity().isBlank()) missing.add("Pharmacy City");
        if (p.getPharmacyState() == null || p.getPharmacyState().isBlank()) missing.add("Pharmacy State");
        if (p.getPharmacyPhone() == null || p.getPharmacyPhone().isBlank()) missing.add("Pharmacy Phone");
        if (p.getWorkingHoursStart() == null) missing.add("Working Hours Start");
        if (p.getWorkingHoursEnd() == null) missing.add("Working Hours End");
        if (p.getLicenseDocumentUrl() == null && (p.getLicenseDocumentDriveLink() == null || p.getLicenseDocumentDriveLink().isBlank())) missing.add("License Document");

        int total = 13;
        int filled = total - missing.size();
        res.setProfileCompletionPercent((int) Math.round((double) filled / total * 100));
        res.setMissingFields(missing);
    }

    private <T> void validateRequest(T request) {
        if (request == null) {
            return;
        }
        Collection<ConstraintViolation<T>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new IllegalArgumentException(violations.iterator().next().getMessage());
        }
    }

    private List<String> splitList(String value) {
        if (value == null || value.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(entry -> !entry.isBlank())
                .toList();
    }

    private String firstNonBlank(String primary, String secondary) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return secondary;
    }

    private void syncCommonPhone(User user, String phone) {
        if (phone != null && !phone.isBlank()) {
            user.setPhone(phone);
        }
    }

    private void validateDriveLink(String link) {
        if (link == null || link.isBlank()) {
            return;
        }
        if (!link.contains("drive.google.com")) {
            throw new IllegalArgumentException("Document link must be a valid Google Drive URL");
        }
    }

    private void ensureDocumentLinkPresent(DocumentViewType viewType, String link, String label) {
        if (viewType == DocumentViewType.GOOGLE_DRIVE && (link == null || link.isBlank())) {
            throw new IllegalArgumentException(label + " Google Drive link is required");
        }
    }

    private void validateAvailability(LocalTime startTime, LocalTime endTime, String availabilityDays, Integer slotDurationMinutes) {
        if (startTime == null && endTime == null && (availabilityDays == null || availabilityDays.isBlank()) && slotDurationMinutes == null) {
            return;
        }
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Availability start and end time are required");
        }
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("Availability end time must be after start time");
        }
        if (availabilityDays == null || availabilityDays.isBlank()) {
            throw new IllegalArgumentException("At least one availability day is required");
        }
        if (slotDurationMinutes == null || slotDurationMinutes <= 0) {
            throw new IllegalArgumentException("Slot duration is required");
        }
    }

    private void validateWorkingHours(LocalTime startTime, LocalTime endTime) {
        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("Working hours end time must be after start time");
        }
    }

    private void applyDocumentUrl(User user, String documentKey, String url) {
        switch (user.getRole()) {
            case DOCTOR -> {
                DoctorProfile profile = doctorProfileRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Doctor profile not found"));
                if ("degree".equalsIgnoreCase(documentKey)) {
                    profile.setDegreeCertificateUrl(url);
                    profile.setDegreeDocumentViewType(DocumentViewType.UPLOAD);
                } else if ("license".equalsIgnoreCase(documentKey)) {
                    profile.setLicenseDocumentUrl(url);
                    profile.setLicenseDocumentViewType(DocumentViewType.UPLOAD);
                } else {
                    throw new IllegalArgumentException("Unsupported document key");
                }
                doctorProfileRepository.save(profile);
            }
            case PHARMACIST -> {
                if (!"license".equalsIgnoreCase(documentKey)) {
                    throw new IllegalArgumentException("Unsupported document key");
                }
                PharmacistProfile profile = pharmacistProfileRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Pharmacist profile not found"));
                profile.setLicenseDocumentUrl(url);
                profile.setLicenseDocumentViewType(DocumentViewType.UPLOAD);
                pharmacistProfileRepository.save(profile);
            }
            default -> throw new IllegalArgumentException("Document uploads are only supported for doctor and pharmacist profiles");
        }
    }

    private void clearDocument(User user, String documentKey) {
        switch (user.getRole()) {
            case DOCTOR -> {
                DoctorProfile profile = doctorProfileRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Doctor profile not found"));
                if ("degree".equalsIgnoreCase(documentKey)) {
                    profile.setDegreeCertificateUrl(null);
                    profile.setDegreeDocumentDriveLink(null);
                    profile.setDegreeDocumentViewType(null);
                } else if ("license".equalsIgnoreCase(documentKey)) {
                    profile.setLicenseDocumentUrl(null);
                    profile.setLicenseDocumentDriveLink(null);
                    profile.setLicenseDocumentViewType(null);
                } else {
                    throw new IllegalArgumentException("Unsupported document key");
                }
                doctorProfileRepository.save(profile);
            }
            case PHARMACIST -> {
                if (!"license".equalsIgnoreCase(documentKey)) {
                    throw new IllegalArgumentException("Unsupported document key");
                }
                PharmacistProfile profile = pharmacistProfileRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Pharmacist profile not found"));
                profile.setLicenseDocumentUrl(null);
                profile.setLicenseDocumentDriveLink(null);
                profile.setLicenseDocumentViewType(null);
                pharmacistProfileRepository.save(profile);
            }
            default -> throw new IllegalArgumentException("Document deletion is only supported for doctor and pharmacist profiles");
        }
    }
}
