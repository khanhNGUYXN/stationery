package com.hmt.stationery.service;

import com.hmt.stationery.domain.Employee;
import com.hmt.stationery.dto.LoginRequest;
import com.hmt.stationery.dto.LoginResponse;
import com.hmt.stationery.repository.EmployeeRepository;
import com.hmt.stationery.security.JwtTokenProvider;
import com.hmt.stationery.security.AccountDisabledException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Employee employee = employeeRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            // Check if user is active
            if (employee.getStatus() != Employee.Status.ACTIVE) {
                throw new AccountDisabledException(
                        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
            }

            // Check if user is approved
            if (employee.getApprovalStatus() != Employee.ApprovalStatus.APPROVED) {
                if (employee.getApprovalStatus() == Employee.ApprovalStatus.PENDING) {
                    throw new AccountDisabledException(
                            "Tài khoản của bạn chưa được phê duyệt. Vui lòng chờ quản trị viên phê duyệt.");
                } else if (employee.getApprovalStatus() == Employee.ApprovalStatus.REJECTED) {
                    throw new AccountDisabledException(
                            "Tài khoản của bạn đã bị từ chối phê duyệt. Vui lòng liên hệ quản trị viên.");
                } else {
                    throw new AccountDisabledException(
                            "Tài khoản của bạn không hợp lệ. Vui lòng liên hệ quản trị viên.");
                }
            }

            String token = jwtTokenProvider.generateToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

            return LoginResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .employee(mapToEmployeeDto(employee))
                    .build();
        } catch (AccountDisabledException e) {
            // Re-throw the AccountDisabledException to be handled by the controller
            throw e;
        } catch (BadCredentialsException e) {
            // For wrong password
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng");
        } catch (UsernameNotFoundException e) {
            // For user not found
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng");
        } catch (Exception e) {
            // For other authentication failures, throw a generic error
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng");
        }
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
