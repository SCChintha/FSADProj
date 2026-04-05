package com.antifsad.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "actor_user_id")
    private User actor;

    @Column(nullable = false, length = 120)
    private String action;

    @Column(length = 80)
    private String category;

    @Column(length = 40)
    @Builder.Default
    private String severity = "INFO";

    @Column(length = 80)
    private String targetType;

    private Long targetId;

    @Column(length = 1000)
    private String details;

    @Column(name = "metadata_json", length = 4000)
    private String metadataJson;

    @Column(nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
