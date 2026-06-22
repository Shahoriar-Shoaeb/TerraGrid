package com.terragrid.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private KpiData kpi;
    private List<WarehouseStockData> warehouseStockData;
    private List<DailyMovementData> dailyMovements;
    private List<?> recentMovements; // Using generic list to avoid circular dependency in DTOs

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiData {
        private Long totalItems;
        private Long totalStock;
        private Long lowStockAlerts;
        private Long pendingTransfers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseStockData {
        private String name;
        private Long totalStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyMovementData {
        private String date;
        private Integer added;
        private Integer removed;
        private Integer transferred;
    }
}
