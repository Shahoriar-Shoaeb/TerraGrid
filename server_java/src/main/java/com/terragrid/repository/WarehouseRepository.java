package com.terragrid.repository;

import com.terragrid.model.Warehouse;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {
    @EntityGraph(attributePaths = {"stockLevels", "stockLevels.item"})
    Optional<Warehouse> findById(Integer id);

    @EntityGraph(attributePaths = {"stockLevels"})
    List<Warehouse> findAll();
}
