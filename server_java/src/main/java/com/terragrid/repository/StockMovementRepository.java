package com.terragrid.repository;

import com.terragrid.model.MovementType;
import com.terragrid.model.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Integer> {
    Page<StockMovement> findByWarehouseId(Integer warehouseId, Pageable pageable);
    Page<StockMovement> findByItemId(Integer itemId, Pageable pageable);

    Long countByMovementTypeIn(Collection<MovementType> types);

    List<StockMovement> findTop10ByOrderByTimestampDesc();

    List<StockMovement> findByTimestampAfter(LocalDateTime timestamp);

    @Query("SELECT m FROM StockMovement m WHERE " +
           "(:userId IS NULL OR m.userId = :userId) AND " +
           "(:warehouseId IS NULL OR m.warehouseId = :warehouseId) AND " +
           "(:itemId IS NULL OR m.itemId = :itemId) AND " +
           "(:type IS NULL OR m.movementType = :type) AND " +
           "(CAST(:from AS timestamp) IS NULL OR m.timestamp >= :from) AND " +
           "(CAST(:to AS timestamp) IS NULL OR m.timestamp <= :to)")
    Page<StockMovement> findFilteredMovements(
            @Param("userId") Integer userId, 
            @Param("warehouseId") Integer warehouseId, 
            @Param("itemId") Integer itemId,
            @Param("type") MovementType type,
            @Param("from") LocalDateTime from, 
            @Param("to") LocalDateTime to, 
            Pageable pageable);
}
