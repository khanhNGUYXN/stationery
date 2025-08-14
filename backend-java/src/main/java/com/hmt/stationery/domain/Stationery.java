package com.hmt.stationery.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
import java.util.List;

@Entity
@Table(name = "stationeries")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Stationery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "code", unique = true, nullable = false)
    private String code;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Positive
    @Column(name = "cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    @NotNull
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "minimum_stock", nullable = false)
    private Integer minimumStock = 10;

    @Column(name = "image_url")
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "stationery_tags", joinColumns = @JoinColumn(name = "stationery_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Column(name = "category")
    private String category;

    @Column(name = "brand")
    private String brand;

    @Column(name = "model")
    private String model;

    @Column(name = "specifications", columnDefinition = "TEXT")
    private String specifications;

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
