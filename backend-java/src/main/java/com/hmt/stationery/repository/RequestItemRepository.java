package com.hmt.stationery.repository;

import com.hmt.stationery.domain.RequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestItemRepository extends JpaRepository<RequestItem, Long> {

    List<RequestItem> findByRequestId(Long requestId);

    @Query("SELECT ri FROM RequestItem ri WHERE ri.request.id = :requestId")
    List<RequestItem> findItemsByRequestId(@Param("requestId") Long requestId);

    @Query("SELECT ri FROM RequestItem ri JOIN FETCH ri.stationery WHERE ri.request.id = :requestId")
    List<RequestItem> findItemsWithStationeryByRequestId(@Param("requestId") Long requestId);
}
