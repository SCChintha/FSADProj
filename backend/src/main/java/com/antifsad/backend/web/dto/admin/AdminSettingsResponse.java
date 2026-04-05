package com.antifsad.backend.web.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class AdminSettingsResponse {
    private Map<String, String> values;
}
