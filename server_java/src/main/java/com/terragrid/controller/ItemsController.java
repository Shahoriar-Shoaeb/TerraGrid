package com.terragrid.controller;

import com.terragrid.dto.CategoryResponse;
import com.terragrid.model.InventoryItem;
import com.terragrid.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
public class ItemsController {

    @Autowired
    private ItemService itemService;

    @GetMapping
    public List<InventoryItem> getAllItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category
    ) {
        return itemService.getAllItems(search, category);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItem> getItemById(@PathVariable Integer id) {
        return itemService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(itemService.getCategories());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryItem createItem(@RequestBody InventoryItem item) {
        return itemService.createItem(item);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Integer id, @RequestBody InventoryItem item) {
        try {
            return ResponseEntity.ok(itemService.updateItem(id, item));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteItem(@PathVariable Integer id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok().build();
    }
}
