package com.terragrid.dto;

import lombok.Data;

@Data
public class StockRequest {
    private Integer warehouseId;
    private Integer itemId;
    private Integer quantity;
    private String notes;
}
