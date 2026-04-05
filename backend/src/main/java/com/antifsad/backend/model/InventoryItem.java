package com.antifsad.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory_items", indexes = {
        @Index(name = "idx_inventory_item_name", columnList = "name", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int stock;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    private LocalDate expiryDate;

    @Column(name = "usage_instructions", length = 1000)
    private String usage;

    @Column(length = 1000)
    private String sideEffects;

    @Column(length = 255)
    private String typicalDosage;

    @Column(nullable = false)
    @Builder.Default
    private int lowStockThreshold = 20;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacist_id", foreignKey = @ForeignKey(name = "fk_inventory_item_pharmacist"))
    private User pharmacist;

    @OneToMany(mappedBy = "inventoryItem", fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<MedicineOrderItem> orderItems = new ArrayList<>();
}
