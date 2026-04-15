package com.example.Complaint_Management.service;

import com.example.Complaint_Management.entity.Complaint;
import com.example.Complaint_Management.entity.Notification;
import com.example.Complaint_Management.repository.NotificationRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final com.example.Complaint_Management.repository.UserRepository userRepository;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.from-number:}")
    private String twilioFromNumber;

    @Value("${app.mode.complaint:true}")
    private boolean complaintModeEnabled;

    @PostConstruct
    public void init() {
        if (!twilioAccountSid.isBlank() && !twilioAuthToken.isBlank()) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            log.info("Twilio SMS service initialized");
        } else {
            log.warn("Twilio not configured — SMS notifications disabled");
        }
    }

    @Async
    public void notifyNewComplaint(Complaint complaint) {
        try {
            String citizenMessage = "GramaNiti: உங்கள் புகார் வெற்றிகரமாக பதிவானது. ID: " + complaint.getComplaintNumber();
            sendSms(complaint.getCitizenPhone(), complaint, citizenMessage, "Citizen submit confirmation");

            String staffMessage = "GramaNiti NEW: வார்டு " + complaint.getWardId() + "-ல் புதிய புகார் ("
                    + complaint.getComplaintNumber() + ") பதிவாகியுள்ளது. உடனடி நடவடிக்கை தேவை.";

            // 1. Notify the specific Ward Member
            userRepository.findByWardIdAndRole(complaint.getWardId(), com.example.Complaint_Management.enums.Role.WARD_MEMBER)
                    .ifPresent(wm -> {
                        sendSms(wm.getPhone(), complaint, staffMessage, "Ward Member Alert");
                        saveInAppNotification(complaint, wm.getId(), staffMessage);
                    });

            // 2. Notify Admins
            userRepository.findByRole(com.example.Complaint_Management.enums.Role.ADMIN).forEach(admin -> {
                saveInAppNotification(complaint, admin.getId(), staffMessage);
            });
        } catch (Exception e) {
            log.error("Failed to process background notifications for complaint {}: {}", 
                complaint.getComplaintNumber(), e.getMessage());
        }
    }

    @Async
    public void notifyStatusChange(Complaint complaint, String smsText) {
        try {
            sendSms(complaint.getCitizenPhone(), complaint, smsText, "Status update");
        } catch (Exception e) {
            log.error("Failed status change notification: {}", e.getMessage());
        }
    }

    @Async
    public void notifySlaBreached(Complaint complaint) {
        try {
            String message = "GramaNiti ALERT: புகார் " + complaint.getComplaintNumber()
                    + " கால அவகாசம் தாண்டியுள்ளது. உடனடி நடவடிக்கை தேவை.";

            // Notify citizen
            sendSms(complaint.getCitizenPhone(), complaint, message, "SLA breach alert");

            // Log in-app notification for ward member
            if (complaint.getWardMemberId() != null) {
                saveInAppNotification(complaint, complaint.getWardMemberId(), message);
            }
        } catch (Exception e) {
            log.error("Failed SLA breach notification: {}", e.getMessage());
        }
    }

    private void sendSms(String toPhone, Complaint complaint, String message, String type) {
        Notification notification = Notification.builder()
                .complaintId(complaint.getId())
                .recipientId(complaint.getCitizenId())
                .recipientPhone(toPhone)
                .channel("SMS")
                .message(message)
                .status("PENDING")
                .build();

        try {
            if (!twilioAccountSid.isBlank() && toPhone != null && !toPhone.isBlank()) {
                Message.creator(
                        new PhoneNumber(toPhone),
                        new PhoneNumber(twilioFromNumber),
                        message
                ).create();

                notification.setStatus("SENT");
                notification.setSentAt(LocalDateTime.now());
                log.info("SMS sent to {} for complaint {}", toPhone, complaint.getComplaintNumber());
            } else {
                // Dev mode: just log
                log.info("[SMS-MOCK] To: {} | Message: {}", toPhone, message);
                notification.setStatus("MOCK_SENT");
                notification.setSentAt(LocalDateTime.now());
            }
            notificationRepository.save(notification);
        } catch (Exception e) {
            notification.setStatus("FAILED");
            notification.setErrorMessage(e.getMessage());
            log.error("SMS failed for {}: {}", toPhone, e.getMessage());
            try {
                notificationRepository.save(notification);
            } catch (Exception e2) {
                log.error("Could not even save FAILED notification status: {}", e2.getMessage());
            }
        }
    }

    public void saveInAppNotification(Complaint complaint, java.util.UUID recipientId, String message) {
        try {
            Notification notification = Notification.builder()
                    .complaintId(complaint.getId())
                    .recipientId(recipientId)
                    .channel("IN_APP")
                    .message(message)
                    .status("SENT")
                    .sentAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to save in-app notification: {}", e.getMessage());
        }
    }

    public java.util.List<Notification> getNotificationsForUser(java.util.UUID userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }
}
