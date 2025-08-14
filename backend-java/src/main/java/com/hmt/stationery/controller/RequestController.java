package com.hmt.stationery.controller;

import com.hmt.stationery.dto.StationeryRequestDto;
import com.hmt.stationery.service.StationeryRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
@Slf4j
public class RequestController {

    private final StationeryRequestService requestService;

    @PostMapping
    public ResponseEntity<StationeryRequestDto> createRequest(
            @RequestBody StationeryRequestDto.CreateRequest createRequest) {
        StationeryRequestDto request = requestService.createRequest(createRequest);
        return ResponseEntity.ok(request);
    }

    @GetMapping
    public ResponseEntity<Page<StationeryRequestDto>> getMyRequests(
            @RequestParam(defaultValue = "false") boolean mine,
            @RequestParam(defaultValue = "false") boolean inbox,
            @RequestParam(defaultValue = "false") boolean all,
            Pageable pageable) {

        if (mine) {
            Page<StationeryRequestDto> requests = requestService.getMyRequests(pageable);
            return ResponseEntity.ok(requests);
        } else if (inbox) {
            Page<StationeryRequestDto> requests = requestService.getPendingApprovals(pageable);
            return ResponseEntity.ok(requests);
        } else if (all) {
            Page<StationeryRequestDto> requests = requestService.getApprovalRequests(pageable);
            return ResponseEntity.ok(requests);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<StationeryRequestDto> approveRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        StationeryRequestDto request = requestService.approveRequest(id, reason);
        return ResponseEntity.ok(request);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<StationeryRequestDto> rejectRequest(
            @PathVariable Long id,
            @RequestParam String reason) {
        StationeryRequestDto request = requestService.rejectRequest(id, reason);
        return ResponseEntity.ok(request);
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<StationeryRequestDto> withdrawRequest(@PathVariable Long id) {
        StationeryRequestDto request = requestService.withdrawRequest(id);
        return ResponseEntity.ok(request);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<StationeryRequestDto> cancelRequest(
            @PathVariable Long id,
            @RequestParam String reason) {
        StationeryRequestDto request = requestService.cancelRequest(id, reason);
        return ResponseEntity.ok(request);
    }
}
