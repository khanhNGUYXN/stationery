package com.hmt.stationery.dto;

import com.hmt.stationery.domain.Employee;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {

    private String token;
    private String refreshToken;
    private EmployeeDto employee;
    private String error;
    private Boolean accountDisabled;

    @Data
    public static class EmployeeDto {
        private Long id;
        private String employeeNo;
        private String name;
        private Employee.Role role;
        private String email;
        private String grade;
        private String location;
        private String username;
    }
}
