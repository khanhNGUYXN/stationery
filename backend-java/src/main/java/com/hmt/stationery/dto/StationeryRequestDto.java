package com.hmt.stationery.dto;

import com.hmt.stationery.domain.StationeryRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StationeryRequestDto {

    private Long id;
    private String requestNumber;
    private EmployeeDto requester;
    private List<RequestItemDto> items;
    private LocalDate toDate;
    private String reason;
    private StationeryRequest.Status status;
    private EmployeeDto approver;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private BigDecimal totalAmount;
    private Integer itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<RequestHistoryDto> history;
    private String errorMessage; // Thêm field này để trả về lỗi

    @Data
    public static class EmployeeDto {
        private Long id;
        private String employeeNo;
        private String name;
        private String email;
        private String role;
    }

    @Data
    public static class StationeryDto {
        private Long id;
        private String code;
        private String name;
        private String imageUrl;
    }

    @Data
    public static class RequestHistoryDto {
        private Long id;
        private String action;
        private String description;
        private EmployeeDto actor;
        private String previousStatus;
        private String newStatus;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateRequest {
        private List<RequestItemDto.CreateRequest> items;
        private LocalDate toDate;
        private String reason;
    }
}
