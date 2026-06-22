package com.terragrid.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "StockLevel", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"warehouseId", "itemId"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "warehouseId", insertable = false, updatable = false)
    private Integer warehouseId;

    @Column(name = "itemId", insertable = false, updatable = false)
    private Integer itemId;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer reservedQty = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer version = 0;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouseId", nullable = false)
    @JsonIgnoreProperties("stockLevels")
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itemId", nullable = false)
    @JsonIgnoreProperties("stockLevels")
    private InventoryItem item;
}
