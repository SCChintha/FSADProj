package com.antifsad.backend.service;

import com.antifsad.backend.config.JwtUtil;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import com.antifsad.backend.model.UserStatus;
import com.antifsad.backend.repository.UserRepository;
import com.antifsad.backend.web.dto.LoginRequest;
import com.antifsad.backend.web.dto.SignupRequest;
import com.antifsad.backend.web.dto.AuthResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AuditLogService auditLogService;
    private final ProfileProvisioningService profileProvisioningService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       AuditLogService auditLogService,
                       ProfileProvisioningService profileProvisioningService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.auditLogService = auditLogService;
        this.profileProvisioningService = profileProvisioningService;
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status(UserStatus.ACTIVE)
                .phone(request.getPhone())
                .address(request.getAddress())
                .isApproved(role != Role.DOCTOR && role != Role.PHARMACIST)
                .build();
        userRepository.save(user);
        profileProvisioningService.ensureProfileExists(user);

        auditLogService.log(
                user,
                "USER_SIGNUP",
                "AUTH",
                "INFO",
                "USER",
                user.getId(),
                "New user registered",
                Map.of("role", user.getRole().name())
        );

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException | DisabledException exception) {
            User attemptedUser = userRepository.findByEmail(request.getEmail()).orElse(null);
            auditLogService.log(
                    attemptedUser,
                    "LOGIN_FAILED",
                    "AUTH",
                    "WARN",
                    "USER",
                    attemptedUser != null ? attemptedUser.getId() : null,
                    "Login failed",
                    Map.of("email", request.getEmail(), "reason", exception.getClass().getSimpleName())
            );
            throw exception;
        }

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
        auditLogService.log(
                user,
                "LOGIN_SUCCESS",
                "AUTH",
                "INFO",
                "USER",
                user.getId(),
                "Login successful",
                null
        );

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
