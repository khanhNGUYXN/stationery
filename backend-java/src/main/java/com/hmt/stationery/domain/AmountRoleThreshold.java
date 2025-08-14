package com.hmt.stationery.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "amount_role_thresholds")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class AmountRoleThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Employee.Role role;

    @NotNull
    @Positive
    @Column(name = "monthly_limit", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyLimit;

    @NotNull
    @Positive
    @Column(name = "quarterly_limit", nullable = false, precision = 10, scale = 2)
    private BigDecimal quarterlyLimit;

    @NotNull
    @Positive
    @Column(name = "yearly_limit", nullable = false, precision = 10, scale = 2)
    private BigDecimal yearlyLimit;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
