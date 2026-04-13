package com.example.Complaint_Management.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity

@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor 
@Builder
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "complaint_id")
    private UUID complaintId;

    @Column(name = "recipient_id")
    private UUID recipientId;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "channel") // SMS, EMAIL, IN_APP
    private String channel;

    @Column(name = "message", length = 500)
    private String message;

    @Column(name = "status") // SENT, FAILED, PENDING
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "error_message")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;
}