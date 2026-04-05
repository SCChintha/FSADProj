package com.antifsad.backend.repository;

import com.antifsad.backend.model.InventoryItem;
import com.antifsad.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByPharmacist(User pharmacist);
    void deleteByPharmacist(User pharmacist);
}
