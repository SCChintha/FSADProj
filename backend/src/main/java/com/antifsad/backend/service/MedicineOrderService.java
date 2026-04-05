package com.antifsad.backend.service;

import com.antifsad.backend.model.InventoryItem;
import com.antifsad.backend.model.MedicineOrder;
import com.antifsad.backend.model.MedicineOrderItem;
import com.antifsad.backend.model.MedicineOrderStatus;
import com.antifsad.backend.model.Prescription;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import com.antifsad.backend.repository.InventoryItemRepository;
import com.antifsad.backend.repository.MedicineOrderRepository;
import com.antifsad.backend.repository.PrescriptionRepository;
import com.antifsad.backend.repository.UserRepository;
import com.antifsad.backend.web.dto.MedicineOrderItemRequest;
import com.antifsad.backend.web.dto.MedicineOrderRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class MedicineOrderService {

    private final MedicineOrderRepository medicineOrderRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public MedicineOrderService(MedicineOrderRepository medicineOrderRepository,
                                UserRepository userRepository,
                                PrescriptionRepository prescriptionRepository,
                                InventoryItemRepository inventoryItemRepository) {
        this.medicineOrderRepository = medicineOrderRepository;
        this.userRepository = userRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<MedicineOrder> getAll() {
        return medicineOrderRepository.findAll();
    }

    public List<MedicineOrder> getForPatient(Long patientId) {
        return medicineOrderRepository.findByPatient(requireUser(patientId, Role.PATIENT, "Patient not found"));
    }

    public List<MedicineOrder> getForPharmacist(Long pharmacistId) {
        return medicineOrderRepository.findByPharmacist(requireUser(pharmacistId, Role.PHARMACIST, "Pharmacist not found"));
    }

    public MedicineOrder getById(Long orderId) {
        return medicineOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Medicine order not found"));
    }

    @Transactional
    public MedicineOrder createOrder(MedicineOrderRequest request) {
        User patient = requireUser(request.getPatientId(), Role.PATIENT, "Patient not found");
        User pharmacist = request.getPharmacistId() == null ? null
                : requireUser(request.getPharmacistId(), Role.PHARMACIST, "Pharmacist not found");

        Prescription prescription = null;
        if (request.getPrescriptionId() != null) {
            prescription = prescriptionRepository.findById(request.getPrescriptionId())
                    .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));
            if (!patient.getId().equals(prescription.getPatient().getId())) {
                throw new IllegalArgumentException("Prescription does not belong to the patient");
            }
        }

        MedicineOrder order = MedicineOrder.builder()
                .patient(patient)
                .pharmacist(pharmacist)
                .prescription(prescription)
                .deliveryAddress(request.getDeliveryAddress())
                .notes(request.getNotes())
                .status(MedicineOrderStatus.PLACED)
                .build();
        order.setItems(toOrderItems(request.getItems(), order));
        return medicineOrderRepository.save(order);
    }

    @Transactional
    public MedicineOrder updateStatus(Long orderId, MedicineOrderStatus status, String notes) {
        MedicineOrder order = getById(orderId);
        if (status == MedicineOrderStatus.FULFILLED && order.getStatus() != MedicineOrderStatus.FULFILLED) {
            reserveInventory(order);
        }
        if (notes != null && !notes.isBlank()) {
            order.setNotes(notes);
        }
        order.setStatus(status);
        order.setUpdatedAt(Instant.now());
        return medicineOrderRepository.save(order);
    }

    private List<MedicineOrderItem> toOrderItems(List<MedicineOrderItemRequest> requests, MedicineOrder order) {
        if (requests == null || requests.isEmpty()) {
            throw new IllegalArgumentException("At least one medicine order item is required");
        }
        return requests.stream().map(itemRequest -> {
            InventoryItem inventoryItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Inventory item not found: " + itemRequest.getInventoryItemId()));
            return MedicineOrderItem.builder()
                    .order(order)
                    .inventoryItem(inventoryItem)
                    .quantity(itemRequest.getQuantity())
                    .dosageInstruction(itemRequest.getDosageInstruction())
                    .build();
        }).toList();
    }

    private void reserveInventory(MedicineOrder order) {
        for (MedicineOrderItem item : order.getItems()) {
            InventoryItem inventoryItem = item.getInventoryItem();
            if (inventoryItem.getStock() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for medicine: " + inventoryItem.getName());
            }
            inventoryItem.setStock(inventoryItem.getStock() - item.getQuantity());
            inventoryItemRepository.save(inventoryItem);
        }
    }

    private User requireUser(Long userId, Role role, String notFoundMessage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(notFoundMessage));
        if (user.getRole() != role) {
            throw new IllegalArgumentException("User " + userId + " is not a " + role.name().toLowerCase());
        }
        return user;
    }
}
