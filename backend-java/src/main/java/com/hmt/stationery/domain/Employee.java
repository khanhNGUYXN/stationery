package com.hmt.stationery.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "employee_no", unique = true, nullable = false)
    private String employeeNo;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Email
    @NotBlank
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "approval_status")
    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "superior_employee_no")
    private String superiorEmployeeNo;

    @NotBlank
    @Column(name = "grade", nullable = false)
    private String grade;

    @NotBlank
    @Column(name = "location", nullable = false)
    private String location;

    @NotBlank
    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        EMPLOYEE,
        MANAGER,
        SUPER_ADMIN
    }

    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
