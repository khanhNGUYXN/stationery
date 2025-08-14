package com.hmt.stationery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Pattern(regexp = "^.{6,}$", message = "Password must be at least 6 characters")
    private String newPassword;
}
