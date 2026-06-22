package com.terragrid.controller;

import com.terragrid.dto.StockRequest;
import com.terragrid.dto.TransferRequest;
import com.terragrid.model.StockMovement;
import com.terragrid.repository.UserRepository;
import com.terragrid.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    @Autowired
    private StockService stockService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addStock(@RequestBody StockRequest request, Authentication auth) {
        Integer userId = userRepository.findByEmail(auth.getName()).get().getId();
        try {
            StockMovement movement = stockService.addStock(
                    request.getWarehouseId(),
                    request.getItemId(),
                    request.getQuantity(),
                    userId,
                    request.getNotes()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Stock added successfully", "movement", movement));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeStock(@RequestBody StockRequest request, Authentication auth) {
        Integer userId = userRepository.findByEmail(auth.getName()).get().getId();
        try {
            StockMovement movement = stockService.removeStock(
                    request.getWarehouseId(),
                    request.getItemId(),
                    request.getQuantity(),
                    userId,
                    request.getNotes()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Stock removed successfully", "movement", movement));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transferStock(@RequestBody TransferRequest request, Authentication auth) {
        Integer userId = userRepository.findByEmail(auth.getName()).get().getId();
        try {
            stockService.transferStock(
                    request.getItemId(),
                    request.getFromWarehouseId(),
                    request.getToWarehouseId(),
                    request.getQuantity(),
                    userId,
                    request.getNotes()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Transfer completed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", e.getMessage()));
        }
    }
}
