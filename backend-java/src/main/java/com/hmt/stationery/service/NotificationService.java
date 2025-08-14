package com.hmt.stationery.service;

import com.hmt.stationery.domain.Employee;
import com.hmt.stationery.domain.Notification;
import com.hmt.stationery.domain.StationeryRequest;
import com.hmt.stationery.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void sendRequestCreatedNotification(StationeryRequest request) {
        try {
            // Notify approver
            Notification notification = new Notification();
            notification.setRecipient(request.getApprover());
            notification.setTitle("New Stationery Request");
            notification.setMessage(String.format("You have a new stationery request from %s for %s",
                    request.getRequester().getName(), request.getStationery().getName()));
            notification.setType(Notification.Type.REQUEST_CREATED);
            notification.setRelatedEntityType("StationeryRequest");
            notification.setRelatedEntityId(request.getId());

            notificationRepository.save(notification);
            log.info("Request created notification sent to {}", request.getApprover().getEmail());
        } catch (Exception e) {
            log.error("Failed to send request created notification", e);
            // Don't throw exception to avoid breaking the main flow
        }
    }

    @Transactional
    public void sendRequestApprovedNotification(StationeryRequest request) {
        try {
            // Notify requester
            Notification notification = new Notification();
            notification.setRecipient(request.getRequester());
            notification.setTitle("Request Approved");
            notification.setMessage(String.format("Your request for %s has been approved",
                    request.getStationery().getName()));
            notification.setType(Notification.Type.REQUEST_APPROVED);
            notification.setRelatedEntityType("StationeryRequest");
            notification.setRelatedEntityId(request.getId());

            notificationRepository.save(notification);
            log.info("Request approved notification sent to {}", request.getRequester().getEmail());
        } catch (Exception e) {
            log.error("Failed to send request approved notification", e);
        }
    }

    @Transactional
    public void sendRequestRejectedNotification(StationeryRequest request) {
        try {
            // Notify requester
            Notification notification = new Notification();
            notification.setRecipient(request.getRequester());
            notification.setTitle("Request Rejected");
            notification.setMessage(String.format("Your request for %s has been rejected. Reason: %s",
                    request.getStationery().getName(), request.getRejectionReason()));
            notification.setType(Notification.Type.REQUEST_REJECTED);
            notification.setRelatedEntityType("StationeryRequest");
            notification.setRelatedEntityId(request.getId());

            notificationRepository.save(notification);
            log.info("Request rejected notification sent to {}", request.getRequester().getEmail());
        } catch (Exception e) {
            log.error("Failed to send request rejected notification", e);
        }
    }

    @Transactional
    public void sendRequestWithdrawnNotification(StationeryRequest request) {
        try {
            // Notify approver
            Notification notification = new Notification();
            notification.setRecipient(request.getApprover());
            notification.setTitle("Request Withdrawn");
            notification.setMessage(String.format("Request for %s has been withdrawn by %s",
                    request.getStationery().getName(), request.getRequester().getName()));
            notification.setType(Notification.Type.REQUEST_WITHDRAWN);
            notification.setRelatedEntityType("StationeryRequest");
            notification.setRelatedEntityId(request.getId());

            notificationRepository.save(notification);
            log.info("Request withdrawn notification sent to {}", request.getApprover().getEmail());
        } catch (Exception e) {
            log.error("Failed to send request withdrawn notification", e);
        }
    }

    @Transactional
    public void sendCancellationRequestNotification(StationeryRequest request) {
        try {
            // Notify new approver for cancellation
            Notification notification = new Notification();
            notification.setRecipient(request.getApprover());
            notification.setTitle("Cancellation Request");
            notification.setMessage(String.format("Cancellation request for %s from %s",
                    request.getStationery().getName(), request.getRequester().getName()));
            notification.setType(Notification.Type.REQUEST_CANCELED);
            notification.setRelatedEntityType("StationeryRequest");
            notification.setRelatedEntityId(request.getId());

            notificationRepository.save(notification);
            log.info("Cancellation request notification sent to {}", request.getApprover().getEmail());
        } catch (Exception e) {
            log.error("Failed to send cancellation request notification", e);
        }
    }

    @Transactional
    public void sendPasswordChangeNotification(Employee employee) {
        try {
            // Notify employee about password change
            Notification notification = new Notification();
            notification.setRecipient(employee);
            notification.setTitle("Password Changed");
            notification.setMessage("Your password has been successfully changed");
            notification.setType(Notification.Type.PASSWORD_CHANGED);

            notificationRepository.save(notification);
            log.info("Password change notification sent to {}", employee.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password change notification", e);
        }
    }
}
