package com.hmt.stationery.service;

import com.hmt.stationery.domain.Employee;
import com.hmt.stationery.dto.RegisterRequest;
import com.hmt.stationery.dto.UserManagementDto;
import com.hmt.stationery.dto.ProfileUpdateRequest;
import com.hmt.stationery.dto.ChangePasswordRequest;
import com.hmt.stationery.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserManagementService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @Transactional
    public UserManagementDto registerNewUser(RegisterRequest request) {
        // Check if username already exists
        if (employeeRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Generate employee number
        String employeeNo = generateEmployeeNo();

        Employee employee = new Employee();
        employee.setEmployeeNo(employeeNo);
        employee.setName(request.getFullName());
        employee.setEmail(request.getEmail());
        employee.setUsername(request.getUsername());
        employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        employee.setRole(Employee.Role.EMPLOYEE); // Default role
        employee.setGrade("L1"); // Default grade
        employee.setLocation("Ho Chi Minh"); // Default location
        employee.setIsActive(true);

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToUserManagementDto(savedEmployee);
    }

    @Transactional(readOnly = true)
    public Page<UserManagementDto> getAllUsers(Pageable pageable) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Only Super Admin can view all users
        if (currentEmployee.getRole() != Employee.Role.SUPER_ADMIN) {
            throw new RuntimeException("Only Super Admin can view all users");
        }

        return employeeRepository.findAll(pageable).map(this::mapToUserManagementDto);
    }

    @Transactional
    public UserManagementDto updateUserRole(Long userId, UserManagementDto.UpdateRoleRequest request) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Only Super Admin can update roles
        if (currentEmployee.getRole() != Employee.Role.SUPER_ADMIN) {
            throw new RuntimeException("Only Super Admin can update user roles");
        }

        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate role
        try {
            Employee.Role newRole = Employee.Role.valueOf(request.getRole());
            employee.setRole(newRole);
            employee.setUpdatedAt(LocalDateTime.now());

            Employee savedEmployee = employeeRepository.save(employee);
            return mapToUserManagementDto(savedEmployee);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole());
        }
    }

    @Transactional
    public UserManagementDto updateUserStatus(Long userId, UserManagementDto.UpdateStatusRequest request) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Only Super Admin can update user status
        if (currentEmployee.getRole() != Employee.Role.SUPER_ADMIN) {
            throw new RuntimeException("Only Super Admin can update user status");
        }

        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        employee.setIsActive(request.getIsActive());
        employee.setUpdatedAt(LocalDateTime.now());

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToUserManagementDto(savedEmployee);
    }

    @Transactional
    public UserManagementDto approveUser(Long userId) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Only Super Admin can approve users
        if (currentEmployee.getRole() != Employee.Role.SUPER_ADMIN) {
            throw new RuntimeException("Only Super Admin can approve users");
        }

        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        employee.setApprovalStatus(Employee.ApprovalStatus.APPROVED);
        employee.setUpdatedAt(LocalDateTime.now());

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToUserManagementDto(savedEmployee);
    }

    @Transactional
    public UserManagementDto rejectUser(Long userId) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Only Super Admin can reject users
        if (currentEmployee.getRole() != Employee.Role.SUPER_ADMIN) {
            throw new RuntimeException("Only Super Admin can reject users");
        }

        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        employee.setApprovalStatus(Employee.ApprovalStatus.REJECTED);
        employee.setUpdatedAt(LocalDateTime.now());

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToUserManagementDto(savedEmployee);
    }

    @Transactional(readOnly = true)
    public UserManagementDto getUserById(Long userId) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Only Super Admin can view any user details
        if (currentEmployee.getRole() != Employee.Role.SUPER_ADMIN) {
            throw new RuntimeException("Only Super Admin can view user details");
        }

        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToUserManagementDto(employee);
    }

    @Transactional
    public UserManagementDto updateProfile(ProfileUpdateRequest request) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Check if email is already taken by another user
        if (!currentEmployee.getEmail().equals(request.getEmail())) {
            if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
        }

        currentEmployee.setName(request.getFullName());
        currentEmployee.setEmail(request.getEmail());
        currentEmployee.setLocation(request.getLocation());
        currentEmployee.setUpdatedAt(LocalDateTime.now());

        Employee savedEmployee = employeeRepository.save(currentEmployee);
        return mapToUserManagementDto(savedEmployee);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentEmployee.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        currentEmployee.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        currentEmployee.setUpdatedAt(LocalDateTime.now());

        employeeRepository.save(currentEmployee);
    }

    private String generateEmployeeNo() {
        // Generate employee number like EMP001, EMP002, etc.
        long count = employeeRepository.count();
        return String.format("EMP%03d", count + 1);
    }

    private UserManagementDto mapToUserManagementDto(Employee employee) {
        UserManagementDto dto = new UserManagementDto();
        dto.setId(employee.getId());
        dto.setEmployeeNo(employee.getEmployeeNo());
        dto.setName(employee.getName());
        dto.setEmail(employee.getEmail());
        dto.setApprovalStatus(employee.getApprovalStatus().name());
        dto.setUsername(employee.getUsername());
        dto.setRole(employee.getRole().name());
        dto.setGrade(employee.getGrade());
        dto.setLocation(employee.getLocation());
        dto.setSuperiorEmployeeNo(employee.getSuperiorEmployeeNo());
        dto.setIsActive(employee.getIsActive());
        dto.setCreatedAt(employee.getCreatedAt());
        dto.setUpdatedAt(employee.getUpdatedAt());
        return dto;
    }
}
