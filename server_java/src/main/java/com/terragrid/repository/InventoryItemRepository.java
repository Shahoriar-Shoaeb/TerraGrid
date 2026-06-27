package com.terragrid.repository;

import com.terragrid.dto.CategoryResponse;
import com.terragrid.model.InventoryItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Integer> {
    @EntityGraph(attributePaths = {"stockLevels", "stockLevels.warehouse"})
    Optional<InventoryItem> findById(Integer id);

    Optional<InventoryItem> findBySku(String sku);

    @Query("SELECT new com.terragrid.dto.CategoryResponse(i.category, COUNT(i)) FROM InventoryItem i GROUP BY i.category")
    List<CategoryResponse> findCategoriesWithCount();

    @Query("SELECT DISTINCT i FROM InventoryItem i LEFT JOIN FETCH i.stockLevels s LEFT JOIN FETCH s.warehouse w " +
           "WHERE (:category IS NULL OR i.category = :category) " +
           "AND (:searchPattern IS NULL OR LOWER(i.name) LIKE :searchPattern OR LOWER(i.sku) LIKE :searchPattern OR LOWER(i.category) LIKE :searchPattern)")
    List<InventoryItem> findAllFiltered(@Param("searchPattern") String searchPattern, @Param("category") String category);
}
