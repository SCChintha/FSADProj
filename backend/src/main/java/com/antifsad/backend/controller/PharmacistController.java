package com.antifsad.backend.controller;

import com.antifsad.backend.service.AuthFacade;
import com.antifsad.backend.service.InventoryService;
import com.antifsad.backend.service.MedicineOrderService;
import com.antifsad.backend.web.dto.InventoryItemResponse;
import com.antifsad.backend.web.dto.MedicineOrderResponse;
import com.antifsad.backend.web.dto.MedicineOrderStatusUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/pharmacist", "/pharmacist"})
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAuthority('ROLE_PHARMACIST')")
public class PharmacistController {

    private final InventoryService inventoryService;
    private final MedicineOrderService medicineOrderService;
    private final AuthFacade authFacade;

    public PharmacistController(InventoryService inventoryService,
                                MedicineOrderService medicineOrderService,
                                AuthFacade authFacade) {
        this.inventoryService = inventoryService;
        this.medicineOrderService = medicineOrderService;
        this.authFacade = authFacade;
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory() {
        return ResponseEntity.ok(inventoryService.getForPharmacist(authFacade.getCurrentUser()).stream().map(InventoryItemResponse::from).toList());
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders() {
        return ResponseEntity.ok(medicineOrderService.getForPharmacist(authFacade.getCurrentUser().getId()).stream()
                .map(MedicineOrderResponse::from)
                .toList());
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId,
                                               @Valid @RequestBody MedicineOrderStatusUpdateRequest request) {
        return ResponseEntity.ok(MedicineOrderResponse.from(
                medicineOrderService.updateStatus(orderId, request.getStatus(), request.getNotes())
        ));
    }
}
