package com.antifsad.backend.repository;

import com.antifsad.backend.model.AuditLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    @Override
    @EntityGraph(attributePaths = {"actor"})
    java.util.List<AuditLog> findAll();
}
