package com.hmt.stationery.repository;

import com.hmt.stationery.domain.StationeryRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StationeryRequestRepository extends JpaRepository<StationeryRequest, Long> {

        Optional<StationeryRequest> findByRequestNumber(String requestNumber);

        @Query("SELECT sr FROM StationeryRequest sr " +
                        "LEFT JOIN FETCH sr.requester " +
                        "LEFT JOIN FETCH sr.stationery " +
                        "LEFT JOIN FETCH sr.approver " +
                        "WHERE sr.requester.id = :requesterId ORDER BY sr.createdAt DESC")
        Page<StationeryRequest> findByRequesterId(@Param("requesterId") Long requesterId, Pageable pageable);

        @Query("SELECT sr FROM StationeryRequest sr " +
                        "LEFT JOIN FETCH sr.requester " +
                        "LEFT JOIN FETCH sr.stationery " +
                        "LEFT JOIN FETCH sr.approver " +
                        "WHERE sr.approver.id = :approverId AND sr.status IN ('SUBMITTED') ORDER BY sr.createdAt DESC")
        Page<StationeryRequest> findPendingApprovalsByApproverId(@Param("approverId") Long approverId,
                        Pageable pageable);

        @Query("SELECT sr FROM StationeryRequest sr " +
                        "LEFT JOIN FETCH sr.requester " +
                        "LEFT JOIN FETCH sr.stationery " +
                        "LEFT JOIN FETCH sr.approver " +
                        "WHERE sr.status IN ('SUBMITTED') ORDER BY sr.createdAt DESC")
        Page<StationeryRequest> findPendingApprovalsForSuperAdmin(Pageable pageable);

        @Query("SELECT sr FROM StationeryRequest sr WHERE sr.requester.id = :requesterId AND sr.status = :status ORDER BY sr.createdAt DESC")
        List<StationeryRequest> findByRequesterIdAndStatus(@Param("requesterId") Long requesterId,
                        @Param("status") StationeryRequest.Status status);

        @Query("SELECT sr FROM StationeryRequest sr WHERE sr.stationery.id = :stationeryId ORDER BY sr.createdAt DESC")
        List<StationeryRequest> findByStationeryId(@Param("stationeryId") Long stationeryId);

        @Query("SELECT sr FROM StationeryRequest sr WHERE sr.status = :status ORDER BY sr.createdAt DESC")
        List<StationeryRequest> findByStatus(@Param("status") StationeryRequest.Status status);

        @Query("SELECT sr FROM StationeryRequest sr WHERE sr.createdAt >= :fromDate AND sr.createdAt <= :toDate ORDER BY sr.createdAt DESC")
        List<StationeryRequest> findByDateRange(@Param("fromDate") java.time.LocalDateTime fromDate,
                        @Param("toDate") java.time.LocalDateTime toDate);

        @Query("SELECT sr FROM StationeryRequest sr " +
                        "LEFT JOIN FETCH sr.requester " +
                        "LEFT JOIN FETCH sr.stationery " +
                        "LEFT JOIN FETCH sr.approver " +
                        "ORDER BY sr.createdAt DESC")
        Page<StationeryRequest> findAllOrderByCreatedAtDesc(Pageable pageable);

        @Query("SELECT COUNT(sr) FROM StationeryRequest sr WHERE sr.requester.id = :requesterId AND sr.status = 'APPROVED' AND sr.createdAt >= :fromDate")
        Long countApprovedRequestsByRequesterAndDateRange(@Param("requesterId") Long requesterId,
                        @Param("fromDate") java.time.LocalDateTime fromDate);

        @Query("SELECT SUM(sr.totalCost) FROM StationeryRequest sr WHERE sr.requester.id = :requesterId AND sr.status = 'APPROVED' AND sr.createdAt >= :fromDate")
        Double sumApprovedCostByRequesterAndDateRange(@Param("requesterId") Long requesterId,
                        @Param("fromDate") java.time.LocalDateTime fromDate);

}
