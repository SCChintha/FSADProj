package com.antifsad.backend.controller;

import com.antifsad.backend.dto.*;
import com.antifsad.backend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping({"/api/profile", "/profile"})
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(profileService.updateMyProfile(req));
    }

    @PostMapping({"/me/photo", "/photo"})
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        String url = profileService.uploadProfilePhoto(file);
        return ResponseEntity.ok(Map.of("profilePhotoUrl", url));
    }

    @PostMapping("/me/documents")
    public ResponseEntity<?> uploadProfileDocument(@RequestParam("file") MultipartFile file,
                                                   @RequestParam("documentKey") String documentKey) {
        return ResponseEntity.ok(profileService.uploadProfileDocument(file, documentKey));
    }

    @DeleteMapping("/me/documents/{documentKey}")
    public ResponseEntity<?> deleteProfileDocument(@PathVariable String documentKey) {
        profileService.deleteProfileDocument(documentKey);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        profileService.changePassword(
            request.get("currentPassword"),
            request.get("newPassword"),
            request.get("confirmNewPassword")
        );
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getPublicDoctorProfile(@PathVariable Long doctorId) {
        return ResponseEntity.ok(profileService.getPublicDoctorProfile(doctorId));
    }

    @GetMapping("/completion")
    public ResponseEntity<?> getProfileCompletion() {
        return ResponseEntity.ok(profileService.getProfileCompletion());
    }
}
