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
