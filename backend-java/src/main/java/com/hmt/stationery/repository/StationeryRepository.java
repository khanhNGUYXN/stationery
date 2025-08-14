package com.hmt.stationery.repository;

import com.hmt.stationery.domain.Stationery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationeryRepository extends JpaRepository<Stationery, Long> {

    Optional<Stationery> findByCode(String code);

    boolean existsByCode(String code);

    @Query("SELECT s FROM Stationery s WHERE s.isActive = true")
    Page<Stationery> findAllActive(Pageable pageable);

    @Query("SELECT s FROM Stationery s WHERE s.isActive = true AND " +
            "(LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Stationery> searchActive(@Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Stationery s WHERE s.isActive = true AND s.category = :category")
    List<Stationery> findByCategory(@Param("category") String category);

    @Query("SELECT s FROM Stationery s WHERE s.isActive = true AND s.stockQuantity <= s.minimumStock")
    List<Stationery> findLowStockItems();

    @Query("SELECT DISTINCT s.category FROM Stationery s WHERE s.isActive = true AND s.category IS NOT NULL")
    List<String> findAllCategories();

    @Query("SELECT s FROM Stationery s WHERE s.isActive = true AND :tag MEMBER OF s.tags")
    List<Stationery> findByTag(@Param("tag") String tag);
}
