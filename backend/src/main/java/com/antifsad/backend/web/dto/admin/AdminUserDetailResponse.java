package com.antifsad.backend.web.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminUserDetailResponse {
    private AdminUserSummaryResponse user;
    private Object profile;
}
