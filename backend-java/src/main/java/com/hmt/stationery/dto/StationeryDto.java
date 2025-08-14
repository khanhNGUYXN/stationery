package com.hmt.stationery.dto;

import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
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

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Mã sản phẩm không được để trống")
        private String code;

        @NotBlank(message = "Tên sản phẩm không được để trống")
        private String name;

        private String description;

        @NotNull(message = "Giá không được để trống")
        @Positive(message = "Giá phải lớn hơn 0")
        private BigDecimal cost;

        @NotNull(message = "Số lượng tồn kho không được để trống")
        @PositiveOrZero(message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
        private Integer stockQuantity;

        @PositiveOrZero(message = "Số lượng tối thiểu phải lớn hơn hoặc bằng 0")
        private Integer minimumStock;

        private String imageUrl;
        private List<String> tags;
        private String category;
        private String brand;
        private String model;
        private String specifications;
    }

    @Data
    public static class UpdateRequest {
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
    }
}
