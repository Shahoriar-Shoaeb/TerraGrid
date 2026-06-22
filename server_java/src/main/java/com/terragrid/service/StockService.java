package com.terragrid.service;

import com.terragrid.model.*;
import com.terragrid.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockService {

    @Autowired
    private StockLevelRepository stockLevelRepository;

    @Autowired
    private StockMovementRepository movementRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryItemRepository itemRepository;

    @Transactional
    public StockMovement addStock(Integer warehouseId, Integer itemId, Integer quantity, Integer userId, String notes) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        StockLevel stock = stockLevelRepository.findByWarehouseIdAndItemId(warehouseId, itemId)
                .orElse(StockLevel.builder()
                        .warehouse(warehouse)
                        .item(item)
                        .quantity(0)
                        .reservedQty(0)
                        .version(0)
                        .build());

        stock.setQuantity(stock.getQuantity() + quantity);
        stock.setVersion(stock.getVersion() + 1);
        stockLevelRepository.save(stock);

        StockMovement movement = StockMovement.builder()
                .itemId(itemId)
                .warehouseId(warehouseId)
                .movementType(MovementType.ADD)
                .quantity(quantity)
                .userId(userId)
                .notes(notes)
                .build();

        return movementRepository.save(movement);
    }

    @Transactional
    public StockMovement removeStock(Integer warehouseId, Integer itemId, Integer quantity, Integer userId, String notes) {
        StockLevel stock = stockLevelRepository.findByWarehouseIdAndItemId(warehouseId, itemId)
                .orElseThrow(() -> new RuntimeException("Stock not found for this item/warehouse"));

        int available = stock.getQuantity() - stock.getReservedQty();
        if (available < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + available + ", Requested: " + quantity);
        }

        stock.setQuantity(stock.getQuantity() - quantity);
        stock.setVersion(stock.getVersion() + 1);
        stockLevelRepository.save(stock);

        StockMovement movement = StockMovement.builder()
                .itemId(itemId)
                .warehouseId(warehouseId)
                .movementType(MovementType.REMOVE)
                .quantity(quantity)
                .userId(userId)
                .notes(notes)
                .build();

        return movementRepository.save(movement);
    }

    @Transactional
    public void transferStock(Integer itemId, Integer fromId, Integer toId, Integer quantity, Integer userId, String notes) {
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        Warehouse fromWarehouse = warehouseRepository.findById(fromId)
                .orElseThrow(() -> new RuntimeException("Source warehouse not found"));
        Warehouse destWarehouse = warehouseRepository.findById(toId)
                .orElseThrow(() -> new RuntimeException("Destination warehouse not found"));

        if (item.getIsTempSensitive() && destWarehouse.getType() != WarehouseType.COLD_STORAGE) {
            throw new RuntimeException("Temperature-sensitive item \"" + item.getName() + "\" can only be transferred to Cold Storage warehouses");
        }

        StockLevel sourceStock = stockLevelRepository.findByWarehouseIdAndItemId(fromId, itemId)
                .orElseThrow(() -> new RuntimeException("No stock found in source warehouse for this item"));

        int available = sourceStock.getQuantity() - sourceStock.getReservedQty();
        if (available < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + available + ", Requested: " + quantity);
        }

        // Update Source
        sourceStock.setQuantity(sourceStock.getQuantity() - quantity);
        sourceStock.setVersion(sourceStock.getVersion() + 1);
        stockLevelRepository.save(sourceStock);

        // Update Destination
        StockLevel destStock = stockLevelRepository.findByWarehouseIdAndItemId(toId, itemId)
                .orElse(StockLevel.builder()
                        .warehouse(destWarehouse)
                        .item(item)
                        .quantity(0)
                        .reservedQty(0)
                        .version(0)
                        .build());
        
        destStock.setQuantity(destStock.getQuantity() + quantity);
        destStock.setVersion(destStock.getVersion() + 1);
        stockLevelRepository.save(destStock);

        // Movement Logs
        StockMovement movOut = StockMovement.builder()
                .itemId(itemId)
                .warehouseId(fromId)
                .fromWarehouseId(fromId)
                .toWarehouseId(toId)
                .movementType(MovementType.TRANSFER_OUT)
                .quantity(quantity)
                .userId(userId)
                .notes(notes != null ? notes : "Transfer to warehouse #" + toId)
                .build();
        movementRepository.save(movOut);

        StockMovement movIn = StockMovement.builder()
                .itemId(itemId)
                .warehouseId(toId)
                .fromWarehouseId(fromId)
                .toWarehouseId(toId)
                .movementType(MovementType.TRANSFER_IN)
                .quantity(quantity)
                .userId(userId)
                .notes(notes != null ? notes : "Transfer from warehouse #" + fromId)
                .build();
        movementRepository.save(movIn);
    }
}
