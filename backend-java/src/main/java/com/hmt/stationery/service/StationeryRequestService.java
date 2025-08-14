package com.hmt.stationery.service;

import com.hmt.stationery.domain.Employee;
import com.hmt.stationery.domain.Stationery;
import com.hmt.stationery.domain.StationeryRequest;
import com.hmt.stationery.dto.StationeryRequestDto;
import com.hmt.stationery.repository.EmployeeRepository;
import com.hmt.stationery.repository.StationeryRepository;
import com.hmt.stationery.repository.StationeryRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class StationeryRequestService {

    private final StationeryRequestRepository requestRepository;
    private final StationeryRepository stationeryRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    @Transactional
    public StationeryRequestDto createRequest(StationeryRequestDto.CreateRequest createRequest) {
        Employee currentEmployee = authService.getCurrentEmployee();
        Stationery stationery = stationeryRepository.findById(createRequest.getStationeryId())
                .orElseThrow(() -> new RuntimeException("Stationery not found"));

        // Validate eligibility
        validateEligibility(currentEmployee, stationery, createRequest.getQuantity());

        // Find approver (superior)
        Employee approver = findApprover(currentEmployee);

        StationeryRequest request = new StationeryRequest();
        request.setRequester(currentEmployee);
        request.setStationery(stationery);
        request.setQuantity(createRequest.getQuantity());
        request.setToDate(createRequest.getToDate());
        request.setReason(createRequest.getReason());
        request.setStatus(StationeryRequest.Status.SUBMITTED);
        request.setApprover(approver);
        request.setTotalCost(stationery.getCost().multiply(BigDecimal.valueOf(createRequest.getQuantity())));

        request.addHistory("REQUEST_CREATED", "Request created", currentEmployee);

        StationeryRequest savedRequest = requestRepository.save(request);

        // Send notifications
        notificationService.sendRequestCreatedNotification(savedRequest);

        return mapToDto(savedRequest);
    }

    @Transactional(readOnly = true)
    public Page<StationeryRequestDto> getMyRequests(Pageable pageable) {
        try {
            Employee currentEmployee = authService.getCurrentEmployee();
            log.debug("Getting requests for employee: {}", currentEmployee.getId());
            return requestRepository.findByRequesterId(currentEmployee.getId(), pageable)
                    .map(this::mapToDto);
        } catch (Exception e) {
            log.error("Error getting my requests", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public Page<StationeryRequestDto> getPendingApprovals(Pageable pageable) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Both Manager and Super Admin can see all pending requests
        if (currentEmployee.getRole() == Employee.Role.MANAGER || 
            currentEmployee.getRole() == Employee.Role.SUPER_ADMIN) {
            return requestRepository.findPendingApprovalsForSuperAdmin(pageable)
                    .map(this::mapToDto);
        }

        // Other roles can only see requests assigned to them
        return requestRepository.findPendingApprovalsByApproverId(currentEmployee.getId(), pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<StationeryRequestDto> getAllRequests(Pageable pageable) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Both Manager and Super Admin can see all requests
        if (currentEmployee.getRole() == Employee.Role.MANAGER || 
            currentEmployee.getRole() == Employee.Role.SUPER_ADMIN) {
            return requestRepository.findAll(pageable).map(this::mapToDto);
        }

        throw new RuntimeException("Only Manager and Super Admin can view all requests");
    }

    @Transactional(readOnly = true)
    public Page<StationeryRequestDto> getApprovalRequests(Pageable pageable) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Both Manager and Super Admin can see all requests for approval
        if (currentEmployee.getRole() == Employee.Role.MANAGER || 
            currentEmployee.getRole() == Employee.Role.SUPER_ADMIN) {
            return requestRepository.findAll(pageable).map(this::mapToDto);
        }

        // Other roles can only see requests assigned to them
        return requestRepository.findByRequesterId(currentEmployee.getId(), pageable)
                .map(this::mapToDto);
    }

    @Transactional
    public StationeryRequestDto approveRequest(Long requestId, String reason) {
        Employee currentEmployee = authService.getCurrentEmployee();
        StationeryRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Both Manager and Super Admin can approve any request
        boolean canApprove = (currentEmployee.getRole() == Employee.Role.MANAGER || 
                             currentEmployee.getRole() == Employee.Role.SUPER_ADMIN) ||
                request.getApprover().getId().equals(currentEmployee.getId());

        if (!canApprove) {
            throw new RuntimeException("You are not authorized to approve this request");
        }

        if (request.getStatus() != StationeryRequest.Status.SUBMITTED) {
            throw new RuntimeException("Request is not in submitted status");
        }

        request.setStatus(StationeryRequest.Status.APPROVED);
        request.setApprovedAt(java.time.LocalDateTime.now());
        request.addHistory("REQUEST_APPROVED", reason, currentEmployee);

        StationeryRequest savedRequest = requestRepository.save(request);

        // Update stock
        updateStock(savedRequest);

        // Send notifications
        notificationService.sendRequestApprovedNotification(savedRequest);

        return mapToDto(savedRequest);
    }

    @Transactional
    public StationeryRequestDto rejectRequest(Long requestId, String reason) {
        Employee currentEmployee = authService.getCurrentEmployee();
        StationeryRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Both Manager and Super Admin can reject any request
        boolean canReject = (currentEmployee.getRole() == Employee.Role.MANAGER || 
                            currentEmployee.getRole() == Employee.Role.SUPER_ADMIN) ||
                request.getApprover().getId().equals(currentEmployee.getId());

        if (!canReject) {
            throw new RuntimeException("You are not authorized to reject this request");
        }

        if (request.getStatus() != StationeryRequest.Status.SUBMITTED) {
            throw new RuntimeException("Request is not in submitted status");
        }

        request.setStatus(StationeryRequest.Status.REJECTED);
        request.setRejectionReason(reason);
        request.addHistory("REQUEST_REJECTED", reason, currentEmployee);

        StationeryRequest savedRequest = requestRepository.save(request);

        // Send notifications
        notificationService.sendRequestRejectedNotification(savedRequest);

        return mapToDto(savedRequest);
    }

    @Transactional
    public StationeryRequestDto withdrawRequest(Long requestId) {
        Employee currentEmployee = authService.getCurrentEmployee();
        StationeryRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getRequester().getId().equals(currentEmployee.getId())) {
            throw new RuntimeException("You are not authorized to withdraw this request");
        }

        if (request.getStatus() != StationeryRequest.Status.SUBMITTED) {
            throw new RuntimeException("Request cannot be withdrawn in current status");
        }

        request.setStatus(StationeryRequest.Status.WITHDRAWN);
        request.addHistory("REQUEST_WITHDRAWN", "Request withdrawn by requester", currentEmployee);

        StationeryRequest savedRequest = requestRepository.save(request);

        // Send notifications
        notificationService.sendRequestWithdrawnNotification(savedRequest);

        return mapToDto(savedRequest);
    }

    @Transactional
    public StationeryRequestDto cancelRequest(Long requestId, String reason) {
        Employee currentEmployee = authService.getCurrentEmployee();
        StationeryRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getRequester().getId().equals(currentEmployee.getId())) {
            throw new RuntimeException("You are not authorized to cancel this request");
        }

        if (request.getStatus() != StationeryRequest.Status.APPROVED) {
            throw new RuntimeException("Request must be approved to be cancelled");
        }

        // For cancellation after approval, need superior approval
        Employee superior = findApprover(currentEmployee);
        request.setApprover(superior);
        request.setStatus(StationeryRequest.Status.SUBMITTED);
        request.addHistory("REQUEST_CANCELLATION_REQUESTED", reason, currentEmployee);

        StationeryRequest savedRequest = requestRepository.save(request);

        // Send notifications
        notificationService.sendCancellationRequestNotification(savedRequest);

        return mapToDto(savedRequest);
    }

    public BigDecimal getMonthlySpending(Long employeeId) {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        java.time.LocalDateTime startOfMonthDateTime = startOfMonth.atStartOfDay();
        Double totalSpent = requestRepository.sumApprovedCostByRequesterAndDateRange(employeeId, startOfMonthDateTime);
        return totalSpent != null ? BigDecimal.valueOf(totalSpent) : BigDecimal.ZERO;
    }

    private void validateEligibility(Employee employee, Stationery stationery, Integer quantity) {
        // Check stock availability
        if (stationery.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        // Check spending limits
        BigDecimal totalCost = stationery.getCost().multiply(BigDecimal.valueOf(quantity));
        BigDecimal monthlySpent = getMonthlySpending(employee.getId());

        // This would need to be enhanced with actual threshold checking
        if (monthlySpent.add(totalCost).compareTo(BigDecimal.valueOf(1000)) > 0) {
            throw new RuntimeException("Monthly spending limit exceeded");
        }
    }

    private Employee findApprover(Employee employee) {
        if (employee.getSuperiorEmployeeNo() == null) {
            throw new RuntimeException("No superior found for approval");
        }

        return employeeRepository.findByEmployeeNo(employee.getSuperiorEmployeeNo())
                .orElseThrow(() -> new RuntimeException("Superior not found"));
    }

    private void updateStock(StationeryRequest request) {
        Stationery stationery = request.getStationery();
        stationery.setStockQuantity(stationery.getStockQuantity() - request.getQuantity());
        stationeryRepository.save(stationery);
    }

    private StationeryRequestDto mapToDto(StationeryRequest request) {
        try {
            StationeryRequestDto dto = new StationeryRequestDto();
            dto.setId(request.getId());
            dto.setRequestNumber(request.getRequestNumber());
            dto.setRequester(request.getRequester() != null ? mapToEmployeeDto(request.getRequester()) : null);
            dto.setStationery(request.getStationery() != null ? mapToStationeryDto(request.getStationery()) : null);
            dto.setQuantity(request.getQuantity());
            dto.setToDate(request.getToDate());
            dto.setReason(request.getReason());
            dto.setStatus(request.getStatus());
            dto.setApprover(request.getApprover() != null ? mapToEmployeeDto(request.getApprover()) : null);
            dto.setApprovedAt(request.getApprovedAt());
            dto.setRejectionReason(request.getRejectionReason());
            dto.setTotalCost(request.getTotalCost());
            dto.setCreatedAt(request.getCreatedAt());
            dto.setUpdatedAt(request.getUpdatedAt());
            dto.setHistory(request.getHistory() != null ? request.getHistory().stream()
                    .map(this::mapToHistoryDto)
                    .toList() : new ArrayList<>());
            return dto;
        } catch (Exception e) {
            log.error("Error mapping request to DTO: {}", request.getId(), e);
            throw e;
        }
    }

    private StationeryRequestDto.EmployeeDto mapToEmployeeDto(Employee employee) {
        StationeryRequestDto.EmployeeDto dto = new StationeryRequestDto.EmployeeDto();
        dto.setId(employee.getId());
        dto.setEmployeeNo(employee.getEmployeeNo());
        dto.setName(employee.getName());
        dto.setEmail(employee.getEmail());
        dto.setRole(employee.getRole().name());
        return dto;
    }

    private StationeryRequestDto.StationeryDto mapToStationeryDto(Stationery stationery) {
        StationeryRequestDto.StationeryDto dto = new StationeryRequestDto.StationeryDto();
        dto.setId(stationery.getId());
        dto.setCode(stationery.getCode());
        dto.setName(stationery.getName());
        dto.setImageUrl(stationery.getImageUrl());
        return dto;
    }

    private StationeryRequestDto.RequestHistoryDto mapToHistoryDto(com.hmt.stationery.domain.RequestHistory history) {
        StationeryRequestDto.RequestHistoryDto dto = new StationeryRequestDto.RequestHistoryDto();
        dto.setId(history.getId());
        dto.setAction(history.getAction());
        dto.setDescription(history.getDescription());
        dto.setActor(mapToEmployeeDto(history.getActor()));
        dto.setPreviousStatus(history.getPreviousStatus() != null ? history.getPreviousStatus().name() : null);
        dto.setNewStatus(history.getNewStatus() != null ? history.getNewStatus().name() : null);
        dto.setCreatedAt(history.getCreatedAt());
        return dto;
    }
}
