package com.antifsad.backend.web.dto.admin;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class AdminSettingsUpdateRequest {
    private Map<String, String> values;
}
