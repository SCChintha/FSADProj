package com.antifsad.backend.repository;

import com.antifsad.backend.model.Complaint;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    @Override
    @EntityGraph(attributePaths = {"createdByUser", "targetUser", "relatedAppointment", "relatedPrescription", "assignedAdmin"})
    java.util.List<Complaint> findAll();
}
