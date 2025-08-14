package com.hmt.stationery.controller;

import com.hmt.stationery.dto.LoginRequest;
import com.hmt.stationery.dto.LoginResponse;
import com.hmt.stationery.dto.RegisterRequest;
import com.hmt.stationery.dto.UserManagementDto;
import com.hmt.stationery.dto.ProfileUpdateRequest;
import com.hmt.stationery.dto.ChangePasswordRequest;
import com.hmt.stationery.service.AuthService;
import com.hmt.stationery.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserManagementService userManagementService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse.EmployeeDto> getCurrentUser() {
        // This would return current user info
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<UserManagementDto> registerUser(@Valid @RequestBody RegisterRequest request) {
        UserManagementDto user = userManagementService.registerNewUser(request);
        return ResponseEntity.ok(user);
    }

    // User Management endpoints (Super Admin only)
    @GetMapping("/users")
    public ResponseEntity<Page<UserManagementDto>> getAllUsers(Pageable pageable) {
        Page<UserManagementDto> users = userManagementService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserManagementDto> getUserById(@PathVariable Long id) {
        UserManagementDto user = userManagementService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserManagementDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UserManagementDto.UpdateRoleRequest request) {
        UserManagementDto user = userManagementService.updateUserRole(id, request);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserManagementDto> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserManagementDto.UpdateStatusRequest request) {
        UserManagementDto user = userManagementService.updateUserStatus(id, request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<UserManagementDto> approveUser(@PathVariable Long id) {
        UserManagementDto user = userManagementService.approveUser(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/reject")
    public ResponseEntity<UserManagementDto> rejectUser(@PathVariable Long id) {
        UserManagementDto user = userManagementService.rejectUser(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserManagementDto> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        UserManagementDto user = userManagementService.updateProfile(request);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userManagementService.changePassword(request);
        return ResponseEntity.ok().build();
    }
}
