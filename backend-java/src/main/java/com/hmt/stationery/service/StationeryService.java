package com.hmt.stationery.service;

import com.hmt.stationery.domain.AmountRoleThreshold;
import com.hmt.stationery.domain.Employee;
import com.hmt.stationery.domain.Stationery;
import com.hmt.stationery.dto.StationeryDto;
import com.hmt.stationery.repository.AmountRoleThresholdRepository;
import com.hmt.stationery.repository.StationeryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StationeryService {

    private final StationeryRepository stationeryRepository;
    private final AmountRoleThresholdRepository thresholdRepository;
    private final AuthService authService;
    private final StationeryRequestService requestService;

    public Page<StationeryDto> getAllStationeries(String search, Pageable pageable) {
        Page<Stationery> stationeries;
        if (search != null && !search.trim().isEmpty()) {
            stationeries = stationeryRepository.searchActive(search.trim(), pageable);
        } else {
            stationeries = stationeryRepository.findAllActive(pageable);
        }

        return stationeries.map(this::mapToDto);
    }

    public StationeryDto getStationeryById(Long id) {
        Stationery stationery = stationeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stationery not found"));

        return mapToDtoWithEligibility(stationery);
    }

    public StationeryDto getStationeryByCode(String code) {
        Stationery stationery = stationeryRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Stationery not found"));

        return mapToDtoWithEligibility(stationery);
    }

    public List<String> getAllCategories() {
        return stationeryRepository.findAllCategories();
    }

    public List<StationeryDto> getLowStockItems() {
        List<Stationery> lowStockItems = stationeryRepository.findLowStockItems();
        return lowStockItems.stream()
                .map(this::mapToDto)
                .toList();
    }

    public StationeryDto.AvailabilityResponse checkAvailability(Long stationeryId) {
        Employee currentEmployee = authService.getCurrentEmployee();
        Stationery stationery = stationeryRepository.findById(stationeryId)
                .orElseThrow(() -> new RuntimeException("Stationery not found"));

        // Check stock availability
        boolean isAvailable = stationery.getStockQuantity() > 0;

        // Check eligibility based on role and spending limits
        boolean isEligible = checkEligibility(currentEmployee, stationery);

        return StationeryDto.AvailabilityResponse.builder()
                .isAvailable(isAvailable)
                .isEligible(isEligible)
                .stockQuantity(stationery.getStockQuantity())
                .cost(stationery.getCost())
                .build();
    }

    private boolean checkEligibility(Employee employee, Stationery stationery) {
        Optional<AmountRoleThreshold> threshold = thresholdRepository.findByRole(employee.getRole());

        if (threshold.isEmpty()) {
            return false;
        }

        // Check monthly spending limit
        BigDecimal monthlySpent = requestService.getMonthlySpending(employee.getId());
        BigDecimal monthlyLimit = threshold.get().getMonthlyLimit();

        return monthlySpent.add(stationery.getCost()).compareTo(monthlyLimit) <= 0;
    }

    @Transactional
    public StationeryDto createStationery(StationeryDto.CreateRequest request) {
        // Check if code already exists
        if (stationeryRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại");
        }

        Stationery stationery = new Stationery();
        stationery.setCode(request.getCode());
        stationery.setName(request.getName());
        stationery.setDescription(request.getDescription());
        stationery.setCost(request.getCost());
        stationery.setStockQuantity(request.getStockQuantity());
        stationery.setMinimumStock(request.getMinimumStock() != null ? request.getMinimumStock() : 0);
        stationery.setImageUrl(request.getImageUrl());
        stationery.setTags(request.getTags());
        stationery.setCategory(request.getCategory());
        stationery.setBrand(request.getBrand());
        stationery.setModel(request.getModel());
        stationery.setSpecifications(request.getSpecifications());
        // stationery.setMonthlyLimit(request.getMonthlyLimit());
        // stationery.setQuarterlyLimit(request.getQuarterlyLimit());
        // stationery.setYearlyLimit(request.getYearlyLimit());
        stationery.setIsActive(true);

        Stationery savedStationery = stationeryRepository.save(stationery);
        return mapToDto(savedStationery);
    }

    @Transactional
    public StationeryDto updateStationery(Long id, StationeryDto.UpdateRequest request) {
        Stationery stationery = stationeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        if (request.getName() != null)
            stationery.setName(request.getName());
        if (request.getDescription() != null)
            stationery.setDescription(request.getDescription());
        if (request.getCost() != null)
            stationery.setCost(request.getCost());
        if (request.getStockQuantity() != null)
            stationery.setStockQuantity(request.getStockQuantity());
        if (request.getMinimumStock() != null)
            stationery.setMinimumStock(request.getMinimumStock());
        if (request.getImageUrl() != null)
            stationery.setImageUrl(request.getImageUrl());
        if (request.getTags() != null)
            stationery.setTags(request.getTags());
        if (request.getCategory() != null)
            stationery.setCategory(request.getCategory());
        if (request.getBrand() != null)
            stationery.setBrand(request.getBrand());
        if (request.getModel() != null)
            stationery.setModel(request.getModel());
        if (request.getSpecifications() != null)
            stationery.setSpecifications(request.getSpecifications());
        if (request.getIsActive() != null)
            stationery.setIsActive(request.getIsActive());
        // if (request.getMonthlyLimit() != null)
        // stationery.setMonthlyLimit(request.getMonthlyLimit());
        // if (request.getQuarterlyLimit() != null)
        // stationery.setQuarterlyLimit(request.getQuarterlyLimit());
        // if (request.getYearlyLimit() != null)
        // stationery.setYearlyLimit(request.getYearlyLimit());

        Stationery savedStationery = stationeryRepository.save(stationery);
        return mapToDto(savedStationery);
    }

    @Transactional
    public void deleteStationery(Long id) {
        Stationery stationery = stationeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Soft delete - set isActive to false
        stationery.setIsActive(false);
        stationeryRepository.save(stationery);
    }

    private StationeryDto mapToDto(Stationery stationery) {
        StationeryDto dto = new StationeryDto();
        dto.setId(stationery.getId());
        dto.setCode(stationery.getCode());
        dto.setName(stationery.getName());
        dto.setDescription(stationery.getDescription());
        dto.setCost(stationery.getCost());
        dto.setStockQuantity(stationery.getStockQuantity());
        dto.setMinimumStock(stationery.getMinimumStock());
        dto.setImageUrl(stationery.getImageUrl());
        dto.setTags(stationery.getTags());
        dto.setCategory(stationery.getCategory());
        dto.setBrand(stationery.getBrand());
        dto.setModel(stationery.getModel());
        dto.setSpecifications(stationery.getSpecifications());
        dto.setIsActive(stationery.getIsActive());
        dto.setCreatedAt(stationery.getCreatedAt());
        dto.setUpdatedAt(stationery.getUpdatedAt());
        return dto;
    }

    private StationeryDto mapToDtoWithEligibility(Stationery stationery) {
        StationeryDto dto = mapToDto(stationery);

        Employee currentEmployee = authService.getCurrentEmployee();
        Optional<AmountRoleThreshold> threshold = thresholdRepository.findByRole(currentEmployee.getRole());

        if (threshold.isPresent()) {
            dto.setMonthlyLimit(threshold.get().getMonthlyLimit());
            dto.setQuarterlyLimit(threshold.get().getQuarterlyLimit());
            dto.setYearlyLimit(threshold.get().getYearlyLimit());
        }

        dto.setIsEligible(checkEligibility(currentEmployee, stationery));
        dto.setAvailabilityStatus(dto.getStockQuantity() > 0 ? "In Stock" : "Out of Stock");

        return dto;
    }
}
