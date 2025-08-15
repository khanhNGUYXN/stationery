package com.hmt.stationery.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestItemDto {

    private Long id;
    private Long stationeryId;
    private String stationeryName;
    private String stationeryCode;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;

    public static class CreateRequest {
        private Long stationeryId;
        private Integer quantity;

        // Getters and Setters
        public Long getStationeryId() {
            return stationeryId;
        }

        public void setStationeryId(Long stationeryId) {
            this.stationeryId = stationeryId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
