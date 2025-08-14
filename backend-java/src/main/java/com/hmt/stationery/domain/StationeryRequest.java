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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stationery_requests")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class StationeryRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "request_number", unique = true, nullable = false)
    private String requestNumber;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stationery_id", nullable = false)
    private Stationery stationery;

    @NotNull
    @Positive
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull
    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private Employee approver;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestHistory> history = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status {
        DRAFT,
        SUBMITTED,
        APPROVED,
        REJECTED,
        CANCELED,
        WITHDRAWN
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (requestNumber == null) {
            requestNumber = "REQ-" + System.currentTimeMillis();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addHistory(String action, String description, Employee actor) {
        RequestHistory historyEntry = new RequestHistory();
        historyEntry.setRequest(this);
        historyEntry.setAction(action);
        historyEntry.setDescription(description);
        historyEntry.setActor(actor);
        history.add(historyEntry);
    }
}
