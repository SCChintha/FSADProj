package com.antifsad.backend.web.dto.admin;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class AdminUserUpdateRequest {
    private String name;
    private String phone;
    private String address;
    private String status;
    private Boolean isApproved;
    private Map<String, Object> profileData;
}
