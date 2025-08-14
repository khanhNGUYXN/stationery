package com.hmt.stationery.repository;

import com.hmt.stationery.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientId(@Param("recipientId") Long recipientId, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId AND n.isRead = false ORDER BY n.createdAt DESC")
    Page<Notification> findUnreadByRecipientId(@Param("recipientId") Long recipientId, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :recipientId AND n.isRead = false")
    Long countUnreadByRecipientId(@Param("recipientId") Long recipientId);
}
