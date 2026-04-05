package com.antifsad.backend.controller;

import com.antifsad.backend.model.InventoryItem;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.service.AuthFacade;
import com.antifsad.backend.service.InventoryService;
import com.antifsad.backend.web.dto.InventoryItemResponse;
import com.antifsad.backend.web.dto.InventoryItemRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/pharmacy/inventory", "/api/inventory", "/inventory"})
public class InventoryController {
    private static final Logger log = LoggerFactory.getLogger(InventoryController.class);

    private final InventoryService inventoryService;
    private final AuthFacade authFacade;

    public InventoryController(InventoryService inventoryService, AuthFacade authFacade) {
        this.inventoryService = inventoryService;
        this.authFacade = authFacade;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_PHARMACIST','ROLE_ADMIN','ROLE_DOCTOR')")
    public ResponseEntity<List<InventoryItemResponse>> getInventory() {
        List<InventoryItem> items = authFacade.getCurrentUser().getRole() == Role.PHARMACIST
                ? inventoryService.getForPharmacist(authFacade.getCurrentUser())
                : inventoryService.getAll();
        List<InventoryItemResponse> response = items.stream()
                .map(InventoryItemResponse::from)
                .toList();
        log.info("GET /inventory -> {} records {}", response.size(), response);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_PHARMACIST','ROLE_ADMIN')")
    public ResponseEntity<InventoryItemResponse> create(@Valid @RequestBody InventoryItemRequest request) {
        InventoryItemResponse response = InventoryItemResponse.from(inventoryService.createItem(
                request.getName(),
                request.getStock(),
                request.getPrice(),
                request.getExpiryDate(),
                request.getUsage(),
                request.getSideEffects(),
                request.getTypicalDosage(),
                request.getLowStockThreshold(),
                authFacade.getCurrentUser()
        ));
        log.info("POST /inventory -> {}", response);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PHARMACIST','ROLE_ADMIN')")
    public ResponseEntity<InventoryItemResponse> update(@PathVariable("id") Long id,
                                                        @Valid @RequestBody InventoryItemRequest request) {
        InventoryItemResponse response = InventoryItemResponse.from(inventoryService.updateItem(
                id,
                request.getName(),
                request.getStock(),
                request.getPrice(),
                request.getExpiryDate(),
                request.getUsage(),
                request.getSideEffects(),
                request.getTypicalDosage(),
                request.getLowStockThreshold(),
                authFacade.getCurrentUser()
        ));
        log.info("PUT /inventory/{} -> {}", id, response);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PHARMACIST','ROLE_ADMIN')")
    public ResponseEntity<InventoryItemResponse> updateStock(@PathVariable("id") Long id, @RequestParam("stock") int stock) {
        InventoryItemResponse response = InventoryItemResponse.from(inventoryService.updateStock(id, stock, authFacade.getCurrentUser()));
        log.info("PATCH /inventory/{} -> {}", id, response);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PHARMACIST','ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        inventoryService.deleteItem(id, authFacade.getCurrentUser());
        return ResponseEntity.noContent().build();
    }
}
