package com.terragrid.controller;

import com.terragrid.dto.DashboardResponse;
import com.terragrid.model.MovementType;
import com.terragrid.model.StockMovement;
import com.terragrid.model.Warehouse;
import com.terragrid.repository.InventoryItemRepository;
import com.terragrid.repository.StockLevelRepository;
import com.terragrid.repository.StockMovementRepository;
import com.terragrid.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/movements")
public class MovementsController {

    @Autowired
    private StockMovementRepository movementRepository;

    @Autowired
    private InventoryItemRepository itemRepository;

    @Autowired
    private StockLevelRepository stockLevelRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMovements(
            @RequestParam(required = false) Integer warehouse,
            @RequestParam(required = false) Integer item,
            @RequestParam(required = false) MovementType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("timestamp").descending());
        Page<StockMovement> result = movementRepository.findFilteredMovements(null, warehouse, item, type, from, to, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("total", result.getTotalElements());
        response.put("page", page);
        response.put("limit", limit);
        response.put("data", result.getContent());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboardStats() {
        Long totalItems = itemRepository.count();
        Long totalStock = stockLevelRepository.sumTotalQuantity();
        Long lowStockAlerts = stockLevelRepository.countLowStock();
        Long pendingTransfers = movementRepository.countByMovementTypeIn(Arrays.asList(MovementType.TRANSFER_IN, MovementType.TRANSFER_OUT));

        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<DashboardResponse.WarehouseStockData> warehouseStockData = warehouses.stream().map(wh -> {
            Long whStock = stockLevelRepository.findByWarehouseId(wh.getId()).stream()
                    .mapToLong(sl -> (long) sl.getQuantity())
                    .sum();
            return DashboardResponse.WarehouseStockData.builder()
                    .name(wh.getName())
                    .totalStock(whStock)
                    .build();
        }).collect(Collectors.toList());

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<StockMovement> movements = movementRepository.findByTimestampAfter(sevenDaysAgo);
        
        Map<String, DashboardResponse.DailyMovementData> dailyMap = new TreeMap<>();
        movements.forEach(m -> {
            String date = m.getTimestamp().toLocalDate().toString();
            DashboardResponse.DailyMovementData data = dailyMap.getOrDefault(date, 
                    DashboardResponse.DailyMovementData.builder().date(date).added(0).removed(0).transferred(0).build());
            
            if (m.getMovementType() == MovementType.ADD) data.setAdded(data.getAdded() + m.getQuantity());
            else if (m.getMovementType() == MovementType.REMOVE) data.setRemoved(data.getRemoved() + m.getQuantity());
            else data.setTransferred(data.getTransferred() + m.getQuantity());
            
            dailyMap.put(date, data);
        });

        return ResponseEntity.ok(DashboardResponse.builder()
                .kpi(DashboardResponse.KpiData.builder()
                        .totalItems(totalItems)
                        .totalStock(totalStock != null ? totalStock : 0L)
                        .lowStockAlerts(lowStockAlerts)
                        .pendingTransfers(pendingTransfers)
                        .build())
                .warehouseStockData(warehouseStockData)
                .dailyMovements(new ArrayList<>(dailyMap.values()))
                .recentMovements(movementRepository.findTop10ByOrderByTimestampDesc())
                .build());
    }

    @GetMapping("/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAudit(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) Integer itemId,
            @RequestParam(required = false) MovementType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("timestamp").descending());
        Page<StockMovement> result = movementRepository.findFilteredMovements(userId, warehouseId, itemId, type, from, to, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("total", result.getTotalElements());
        response.put("page", page);
        response.put("limit", limit);
        response.put("data", result.getContent());

        return ResponseEntity.ok(response);
    }
}
