package com.hmt.stationery.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class StationeryDto {

    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal cost;
    private Integer stockQuantity;
    private Integer minimumStock;
    private String imageUrl;
    private List<String> tags;
    private String category;
    private String brand;
    private String model;
    private String specifications;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional fields for product detail page
    private BigDecimal monthlyLimit;
    private BigDecimal quarterlyLimit;
    private BigDecimal yearlyLimit;
    private Boolean isEligible;
    private String availabilityStatus;

    @Data
    @Builder
    public static class AvailabilityResponse {
        private Boolean isAvailable;
        private Boolean isEligible;
        private Integer stockQuantity;
        private BigDecimal cost;
    }
}
