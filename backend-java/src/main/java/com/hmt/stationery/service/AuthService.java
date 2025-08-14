package com.hmt.stationery.service;

import com.hmt.stationery.domain.Employee;
import com.hmt.stationery.dto.LoginRequest;
import com.hmt.stationery.dto.LoginResponse;
import com.hmt.stationery.repository.EmployeeRepository;
import com.hmt.stationery.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        Employee employee = employeeRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        String token = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .employee(mapToEmployeeDto(employee))
                .build();
    }

    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        Employee employee = getCurrentEmployee();

        if (!passwordEncoder.matches(currentPassword, employee.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        employee.setPasswordHash(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee);

        // Send notification
        notificationService.sendPasswordChangeNotification(employee);

        log.info("Password changed for employee: {}", employee.getUsername());
    }

    public Employee getCurrentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return employeeRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    private LoginResponse.EmployeeDto mapToEmployeeDto(Employee employee) {
        LoginResponse.EmployeeDto dto = new LoginResponse.EmployeeDto();
        dto.setId(employee.getId());
        dto.setEmployeeNo(employee.getEmployeeNo());
        dto.setName(employee.getName());
        dto.setRole(employee.getRole());
        dto.setEmail(employee.getEmail());
        dto.setGrade(employee.getGrade());
        dto.setLocation(employee.getLocation());
        dto.setUsername(employee.getUsername());
        return dto;
    }
}
