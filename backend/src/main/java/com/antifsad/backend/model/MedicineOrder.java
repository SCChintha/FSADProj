package com.antifsad.backend.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medicine_orders", indexes = {
        @Index(name = "idx_medicine_order_patient", columnList = "patient_id"),
        @Index(name = "idx_medicine_order_pharmacist", columnList = "pharmacist_id"),
        @Index(name = "idx_medicine_order_status", columnList = "status"),
        @Index(name = "idx_medicine_order_prescription", columnList = "prescription_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_medicine_order_patient"))
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacist_id",
            foreignKey = @ForeignKey(name = "fk_medicine_order_pharmacist"))
    private User pharmacist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id",
            foreignKey = @ForeignKey(name = "fk_medicine_order_prescription"))
    private Prescription prescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private MedicineOrderStatus status = MedicineOrderStatus.PLACED;

    @Column(length = 500)
    private String deliveryAddress;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    private Instant updatedAt;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MedicineOrderItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
