package com.antifsad.backend.repository;

import com.antifsad.backend.model.MedicineOrder;
import com.antifsad.backend.model.MedicineOrderStatus;
import com.antifsad.backend.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicineOrderRepository extends JpaRepository<MedicineOrder, Long> {

    @Override
    @EntityGraph(attributePaths = {"patient", "pharmacist", "prescription", "items", "items.inventoryItem"})
    List<MedicineOrder> findAll();

    @Override
    @EntityGraph(attributePaths = {"patient", "pharmacist", "prescription", "items", "items.inventoryItem"})
    Optional<MedicineOrder> findById(Long id);

    @EntityGraph(attributePaths = {"patient", "pharmacist", "prescription", "items", "items.inventoryItem"})
    List<MedicineOrder> findByPatient(User patient);

    @EntityGraph(attributePaths = {"patient", "pharmacist", "prescription", "items", "items.inventoryItem"})
    List<MedicineOrder> findByPharmacist(User pharmacist);

    @EntityGraph(attributePaths = {"patient", "pharmacist", "prescription", "items", "items.inventoryItem"})
    List<MedicineOrder> findByStatus(MedicineOrderStatus status);

    void deleteByPatient(User patient);

    void deleteByPharmacist(User pharmacist);
}
