package com.antifsad.backend.service;

import com.antifsad.backend.model.AuditLog;
import com.antifsad.backend.model.User;
import com.antifsad.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(User user, String action, String details) {
        persist(user, action, "GENERAL", "INFO", null, null, details, null);
    }

    private void persist(User actor,
                         String action,
                         String category,
                         String severity,
                         String targetType,
                         Long targetId,
                         String details,
                         String metadataJson) {
        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .action(action)
                .category(category)
                .severity(severity)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .metadataJson(metadataJson)
                .build());
    }

    public void log(User actor,
                    String action,
                    String category,
                    String severity,
                    String targetType,
                    Long targetId,
                    String details,
                    Map<String, ?> metadata) {
        String metadataJson = null;
        if (metadata != null && !metadata.isEmpty()) {
            metadataJson = metadata.toString();
        }
        persist(actor, action, category, severity, targetType, targetId, details, metadataJson);
    }
}
