package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.DocumentViewType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentUploadResponse {
    private String documentKey;
    private String documentUrl;
    private DocumentViewType viewType;
}
