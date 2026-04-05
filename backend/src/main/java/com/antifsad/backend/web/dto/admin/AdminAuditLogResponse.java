package com.antifsad.backend.web.dto.admin;

import com.antifsad.backend.model.AuditLog;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class AdminAuditLogResponse {
    private Long id;
    private String action;
    private String category;
    private String severity;
    private String targetType;
    private Long targetId;
    private String details;
    private String metadataJson;
    private Instant createdAt;
    private Long actorId;
    private String actorName;

    public static AdminAuditLogResponse from(AuditLog log) {
        return AdminAuditLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .category(log.getCategory())
                .severity(log.getSeverity())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .details(log.getDetails())
                .metadataJson(log.getMetadataJson())
                .createdAt(log.getCreatedAt())
                .actorId(log.getActor() != null ? log.getActor().getId() : null)
                .actorName(log.getActor() != null ? log.getActor().getName() : "System")
                .build();
    }
}
