package com.antifsad.backend.controller;

import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import com.antifsad.backend.model.UserStatus;
import com.antifsad.backend.repository.UserRepository;
import com.antifsad.backend.service.UserService;
import com.antifsad.backend.web.dto.UserCreateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final com.antifsad.backend.service.ProfileService profileService;

    public UserController(UserRepository userRepository, UserService userService, com.antifsad.backend.service.ProfileService profileService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.profileService = profileService;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateMyProfile(@RequestBody java.util.Map<String, Object> req) {
        return ResponseEntity.ok(profileService.updateMyProfile(req));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<User>> getUsers(@RequestParam(name = "role", required = false) Role role) {
        if (role != null) {
            return ResponseEntity.ok(userRepository.findByRole(role));
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/doctors")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<User>> getDoctors() {
        return ResponseEntity.ok(userRepository.findByRole(Role.DOCTOR).stream()
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .filter(user -> Boolean.TRUE.equals(user.getIsApproved()))
                .toList());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> updateStatus(@PathVariable("id") Long id, @RequestParam("status") UserStatus status) {
        return ResponseEntity.ok(userService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
