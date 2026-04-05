package com.antifsad.backend.service;

import com.antifsad.backend.model.InventoryItem;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import com.antifsad.backend.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    public InventoryService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<InventoryItem> getAll() {
        return inventoryItemRepository.findAll();
    }

    public List<InventoryItem> getForPharmacist(User pharmacist) {
        requirePharmacist(pharmacist);
        return inventoryItemRepository.findByPharmacist(pharmacist);
    }

    @Transactional
    public InventoryItem updateStock(Long id, int newStock, User actor) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found"));
        validateOwnership(item, actor);
        item.setStock(newStock);
        return inventoryItemRepository.save(item);
    }

    @Transactional
    public InventoryItem createItem(String name,
                                    int stock,
                                    BigDecimal price,
                                    LocalDate expiryDate,
                                    String usage,
                                    String sideEffects,
                                    String typicalDosage,
                                    Integer lowStockThreshold,
                                    User actor) {
        InventoryItem item = InventoryItem.builder()
                .name(name)
                .stock(stock)
                .price(price)
                .expiryDate(expiryDate)
                .usage(usage)
                .sideEffects(sideEffects)
                .typicalDosage(typicalDosage)
                .lowStockThreshold(lowStockThreshold)
                .pharmacist(actor != null && actor.getRole() == Role.PHARMACIST ? actor : null)
                .build();
        return inventoryItemRepository.save(item);
    }

    @Transactional
    public InventoryItem updateItem(Long id,
                                    String name,
                                    int stock,
                                    BigDecimal price,
                                    LocalDate expiryDate,
                                    String usage,
                                    String sideEffects,
                                    String typicalDosage,
                                    Integer lowStockThreshold,
                                    User actor) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found"));
        validateOwnership(item, actor);
        item.setName(name);
        item.setStock(stock);
        item.setPrice(price);
        item.setExpiryDate(expiryDate);
        item.setUsage(usage);
        item.setSideEffects(sideEffects);
        item.setTypicalDosage(typicalDosage);
        item.setLowStockThreshold(lowStockThreshold);
        return inventoryItemRepository.save(item);
    }

    @Transactional
    public void deleteItem(Long id, User actor) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found"));
        validateOwnership(item, actor);
        inventoryItemRepository.delete(item);
    }

    private void requirePharmacist(User user) {
        if (user == null || user.getRole() != Role.PHARMACIST) {
            throw new IllegalArgumentException("Only pharmacists can manage inventory items");
        }
    }

    private void validateOwnership(InventoryItem item, User actor) {
        if (actor == null) {
            throw new IllegalArgumentException("Authenticated user required");
        }
        if (actor.getRole() == Role.ADMIN) {
            return;
        }
        requirePharmacist(actor);
        if (item.getPharmacist() != null && !item.getPharmacist().getId().equals(actor.getId())) {
            throw new IllegalArgumentException("You can only manage your own inventory items");
        }
    }
}
