package com.hmt.stationery.controller;

import com.hmt.stationery.dto.StationeryDto;
import com.hmt.stationery.service.StationeryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/stationeries")
@RequiredArgsConstructor
@Slf4j
public class StationeryController {

    private final StationeryService stationeryService;

    @GetMapping
    public ResponseEntity<Page<StationeryDto>> getAllStationeries(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<StationeryDto> stationeries = stationeryService.getAllStationeries(search, pageable);
        return ResponseEntity.ok(stationeries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationeryDto> getStationeryById(@PathVariable Long id) {
        StationeryDto stationery = stationeryService.getStationeryById(id);
        return ResponseEntity.ok(stationery);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<StationeryDto> getStationeryByCode(@PathVariable String code) {
        StationeryDto stationery = stationeryService.getStationeryByCode(code);
        return ResponseEntity.ok(stationery);
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<StationeryDto.AvailabilityResponse> checkAvailability(@PathVariable Long id) {
        StationeryDto.AvailabilityResponse availability = stationeryService.checkAvailability(id);
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = stationeryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<StationeryDto>> getLowStockItems() {
        List<StationeryDto> lowStockItems = stationeryService.getLowStockItems();
        return ResponseEntity.ok(lowStockItems);
    }

    @PostMapping
    public ResponseEntity<StationeryDto> createStationery(@Valid @RequestBody StationeryDto.CreateRequest request) {
        StationeryDto stationery = stationeryService.createStationery(request);
        return ResponseEntity.ok(stationery);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StationeryDto> updateStationery(
            @PathVariable Long id, 
            @Valid @RequestBody StationeryDto.UpdateRequest request) {
        StationeryDto stationery = stationeryService.updateStationery(id, request);
        return ResponseEntity.ok(stationery);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStationery(@PathVariable Long id) {
        stationeryService.deleteStationery(id);
        return ResponseEntity.ok().build();
    }
}
