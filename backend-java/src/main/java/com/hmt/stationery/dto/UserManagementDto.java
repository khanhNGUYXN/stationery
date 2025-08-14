package com.hmt.stationery.dto;

import com.hmt.stationery.domain.Employee;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserManagementDto {

    private Long id;
    private String employeeNo;
    private String name;
    private String email;
    private String approvalStatus;
    private String username;
    private String role;
    private String grade;
    private String location;
    private String superiorEmployeeNo;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class UpdateRoleRequest {
        private String role;
    }

    @Data
    public static class UpdateStatusRequest {
        private Boolean isActive;
    }

    @Data
    public static class UserListResponse {
        private List<UserManagementDto> users;
        private long total;
        private int page;
        private int size;
    }
}
