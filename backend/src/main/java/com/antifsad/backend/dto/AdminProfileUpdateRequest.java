package com.antifsad.backend.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AdminProfileUpdateRequest {
    private String firstName;
    private String lastName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
    private String phone;

    private String department;
    private String designation;
}