package com.antifsad.backend.web.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatUploadResponse {
    private String fileUrl;
    private String fileName;
    private String fileType;
}
