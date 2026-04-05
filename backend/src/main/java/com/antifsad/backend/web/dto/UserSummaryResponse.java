package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.User;
import com.antifsad.backend.model.UserStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class UserSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private UserStatus status;

    public static UserSummaryResponse from(User user) {
        if (user == null) {
            return null;
        }

        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus())
                .build();
    }
}
