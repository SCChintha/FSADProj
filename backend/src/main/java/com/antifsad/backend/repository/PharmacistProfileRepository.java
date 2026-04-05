package com.antifsad.backend.repository;

import com.antifsad.backend.model.PharmacistProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PharmacistProfileRepository extends JpaRepository<PharmacistProfile, Long> {
    Optional<PharmacistProfile> findByUserId(Long userId);
}