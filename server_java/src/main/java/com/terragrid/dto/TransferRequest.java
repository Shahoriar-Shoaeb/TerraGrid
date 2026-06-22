package com.terragrid.dto;

import lombok.Data;

@Data
public class TransferRequest {
    private Integer itemId;
    private Integer fromWarehouseId;
    private Integer toWarehouseId;
    private Integer quantity;
    private String notes;
}
