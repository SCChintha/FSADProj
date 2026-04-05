package com.antifsad.backend.repository;

import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import com.antifsad.backend.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(@Param("search") String search, @Param("role") Role role, @Param("status") UserStatus status, Pageable pageable);

    long countByRole(Role role);
    long countByRoleAndIsApproved(Role role, Boolean isApproved);
    long countByStatus(UserStatus status);
    long countByCreatedAtGreaterThanEqual(Instant date);
}
