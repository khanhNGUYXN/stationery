package com.hmt.stationery.service;

import com.hmt.stationery.domain.Employee;
import com.hmt.stationery.domain.Employee.Role;
import com.hmt.stationery.domain.Stationery;
import com.hmt.stationery.domain.StationeryRequest;
import com.hmt.stationery.domain.RequestItem;
import com.hmt.stationery.dto.StationeryRequestDto;
import com.hmt.stationery.dto.RequestItemDto;
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

        // Validate items
        if (createRequest.getItems() == null || createRequest.getItems().isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất một sản phẩm");
        }

        if (createRequest.getToDate() == null) {
            throw new RuntimeException("Vui lòng chọn ngày cần");
        }

        if (createRequest.getReason() == null || createRequest.getReason().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập lý do yêu cầu");
        }

        // Find approver (superior)
        Employee approver = findApprover(currentEmployee);

        StationeryRequest request = new StationeryRequest();
        request.setRequester(currentEmployee);
        request.setToDate(createRequest.getToDate());
        request.setReason(createRequest.getReason());
        request.setApprover(approver);

        BigDecimal totalAmount = BigDecimal.ZERO;
        int itemCount = 0;

        // Process each item
        for (RequestItemDto.CreateRequest itemRequest : createRequest.getItems()) {
            Stationery stationery = stationeryRepository.findById(itemRequest.getStationeryId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy sản phẩm với ID: " + itemRequest.getStationeryId()));

            // Validate eligibility
            validateEligibility(currentEmployee, stationery, itemRequest.getQuantity());

            // Create request item
            RequestItem item = new RequestItem();
            item.setRequest(request);
            item.setStationery(stationery);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitCost(stationery.getCost());
            item.setTotalCost(stationery.getCost().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

            request.getItems().add(item);
            totalAmount = totalAmount.add(item.getTotalCost());
            itemCount++;
        }

        request.setTotalAmount(totalAmount);
        request.setItemCount(itemCount);

        // Auto approve for SUPER_ADMIN
        if (currentEmployee.getRole() == Role.SUPER_ADMIN) {
            request.setStatus(StationeryRequest.Status.APPROVED);
            request.setApprovedAt(java.time.LocalDateTime.now());
            request.addHistory("REQUEST_CREATED", "Request created and auto-approved for SUPER_ADMIN", currentEmployee);
            request.addHistory("REQUEST_APPROVED", "Auto-approved for SUPER_ADMIN", currentEmployee);
        } else {
            request.setStatus(StationeryRequest.Status.SUBMITTED);
            request.addHistory("REQUEST_CREATED", "Request created", currentEmployee);
        }

        StationeryRequest savedRequest = requestRepository.save(request);

        // Update stock if auto-approved
        if (currentEmployee.getRole() == Role.SUPER_ADMIN) {
            updateStock(savedRequest);
        }

        // Send notifications
        if (currentEmployee.getRole() == Role.SUPER_ADMIN) {
            notificationService.sendRequestApprovedNotification(savedRequest);
        } else {
            notificationService.sendRequestCreatedNotification(savedRequest);
        }

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
            return requestRepository.findAllOrderByCreatedAtDesc(pageable).map(this::mapToDto);
        }

        throw new RuntimeException("Only Manager and Super Admin can view all requests");
    }

    @Transactional(readOnly = true)
    public Page<StationeryRequestDto> getApprovalRequests(Pageable pageable) {
        Employee currentEmployee = authService.getCurrentEmployee();

        // Both Manager and Super Admin can see all requests for approval
        if (currentEmployee.getRole() == Employee.Role.MANAGER ||
                currentEmployee.getRole() == Employee.Role.SUPER_ADMIN) {
            return requestRepository.findAllOrderByCreatedAtDesc(pageable).map(this::mapToDto);
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

        // Direct cancellation - no need for approval
        request.setStatus(StationeryRequest.Status.CANCELED);
        request.setRejectionReason(reason);
        request.addHistory("REQUEST_CANCELED", reason, currentEmployee);

        // Restore stock if request was approved
        restoreStock(request);

        StationeryRequest savedRequest = requestRepository.save(request);

        // Send notifications
        notificationService.sendRequestCanceledNotification(savedRequest);

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
            throw new RuntimeException(String.format(
                    "Không đủ hàng trong kho. Sản phẩm '%s' chỉ còn %d trong kho, bạn yêu cầu %d",
                    stationery.getName(),
                    stationery.getStockQuantity(),
                    quantity));
        }

        // Check spending limits
        BigDecimal totalCost = stationery.getCost().multiply(BigDecimal.valueOf(quantity));
        BigDecimal monthlySpent = getMonthlySpending(employee.getId());

        // This would need to be enhanced with actual threshold checking
        if (monthlySpent.add(totalCost).compareTo(BigDecimal.valueOf(1000)) > 0) {
            throw new RuntimeException(String.format(
                    "Vượt quá giới hạn chi tiêu hàng tháng. Đã chi: %s VNĐ, yêu cầu thêm: %s VNĐ, giới hạn: 1,000 VNĐ",
                    monthlySpent.toPlainString(),
                    totalCost.toPlainString()));
        }
    }

    private Employee findApprover(Employee employee) {
        // SUPER_ADMIN doesn't need approval from superior
        if (employee.getRole() == Role.SUPER_ADMIN) {
            return employee; // Self-approval for SUPER_ADMIN
        }

        if (employee.getSuperiorEmployeeNo() == null) {
            throw new RuntimeException(
                    "Không tìm thấy người phê duyệt cho tài khoản của bạn. Vui lòng liên hệ quản trị viên.");
        }

        return employeeRepository.findByEmployeeNo(employee.getSuperiorEmployeeNo())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy người phê duyệt với mã nhân viên: " + employee.getSuperiorEmployeeNo()));
    }

    private void updateStock(StationeryRequest request) {
        for (RequestItem item : request.getItems()) {
            Stationery stationery = item.getStationery();
            stationery.setStockQuantity(stationery.getStockQuantity() - item.getQuantity());
            stationeryRepository.save(stationery);
        }
    }

    private void restoreStock(StationeryRequest request) {
        for (RequestItem item : request.getItems()) {
            Stationery stationery = item.getStationery();
            stationery.setStockQuantity(stationery.getStockQuantity() + item.getQuantity());
            stationeryRepository.save(stationery);
        }
    }

    private StationeryRequestDto mapToDto(StationeryRequest request) {
        try {
            StationeryRequestDto dto = new StationeryRequestDto();
            dto.setId(request.getId());
            dto.setRequestNumber(request.getRequestNumber());
            dto.setRequester(request.getRequester() != null ? mapToEmployeeDto(request.getRequester()) : null);
            dto.setItems(request.getItems() != null ? request.getItems().stream()
                    .map(this::mapToRequestItemDto)
                    .toList() : new ArrayList<>());
            dto.setToDate(request.getToDate());
            dto.setReason(request.getReason());
            dto.setStatus(request.getStatus());
            dto.setApprover(request.getApprover() != null ? mapToEmployeeDto(request.getApprover()) : null);
            dto.setApprovedAt(request.getApprovedAt());
            dto.setRejectionReason(request.getRejectionReason());
            dto.setTotalAmount(request.getTotalAmount());
            dto.setItemCount(request.getItemCount());
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

    private RequestItemDto mapToRequestItemDto(RequestItem item) {
        RequestItemDto dto = new RequestItemDto();
        dto.setId(item.getId());
        dto.setStationeryId(item.getStationery().getId());
        dto.setStationeryName(item.getStationery().getName());
        dto.setStationeryCode(item.getStationery().getCode());
        dto.setQuantity(item.getQuantity());
        dto.setUnitCost(item.getUnitCost());
        dto.setTotalCost(item.getTotalCost());
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
