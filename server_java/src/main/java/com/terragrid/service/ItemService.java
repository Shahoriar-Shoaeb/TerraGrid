package com.terragrid.service;

import com.terragrid.dto.CategoryResponse;
import com.terragrid.model.InventoryItem;
import com.terragrid.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ItemService {

    @Autowired
    private InventoryItemRepository itemRepository;

    public List<InventoryItem> getAllItems(String search, String category) {
        return itemRepository.findAllFiltered(search, category);
    }

    public List<CategoryResponse> getCategories() {
        return itemRepository.findCategoriesWithCount();
    }

    public Optional<InventoryItem> getItemById(Integer id) {
        return itemRepository.findById(id);
    }

    public InventoryItem createItem(InventoryItem item) {
        return itemRepository.save(item);
    }

    public InventoryItem updateItem(Integer id, InventoryItem itemDetails) {
        InventoryItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        item.setName(itemDetails.getName());
        item.setCategory(itemDetails.getCategory());
        item.setSku(itemDetails.getSku());
        item.setIsTempSensitive(itemDetails.getIsTempSensitive());
        item.setShelfLifeDays(itemDetails.getShelfLifeDays());
        
        return itemRepository.save(item);
    }

    public void deleteItem(Integer id) {
        itemRepository.deleteById(id);
    }
}
