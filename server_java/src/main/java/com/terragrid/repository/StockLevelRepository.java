package com.terragrid.repository;

import com.terragrid.model.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface StockLevelRepository extends JpaRepository<StockLevel, Integer> {
    Optional<StockLevel> findByWarehouseIdAndItemId(Integer warehouseId, Integer itemId);

    @Query("SELECT SUM(s.quantity) FROM StockLevel s")
    Long sumTotalQuantity();

    @Query("SELECT COUNT(s) FROM StockLevel s WHERE s.quantity <= 100")
    Long countLowStock();

    List<StockLevel> findByWarehouseId(Integer warehouseId);
}
