package com.terragrid.service;

import com.terragrid.model.Warehouse;
import com.terragrid.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Optional<Warehouse> getWarehouseById(Integer id) {
        return warehouseRepository.findById(id);
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public Warehouse updateWarehouse(Integer id, Warehouse warehouseDetails) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        warehouse.setName(warehouseDetails.getName());
        warehouse.setLocation(warehouseDetails.getLocation());
        warehouse.setType(warehouseDetails.getType());
        warehouse.setMinTemp(warehouseDetails.getMinTemp());
        warehouse.setMaxTemp(warehouseDetails.getMaxTemp());

        return warehouseRepository.save(warehouse);
    }

    public void deleteWarehouse(Integer id) {
        warehouseRepository.deleteById(id);
    }
}
