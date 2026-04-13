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
        String message = "GramaNiti: புதிய புகார் பதிவாகியுள்ளது. ID: "
                + complaint.getComplaintNumber()
                + " | வகை: " + complaint.getType()
                + " | வார்டு: " + complaint.getWardId();

        sendSms(complaint.getCitizenPhone(), complaint, message,
                "New complaint submitted confirmation");
    }

    @Async
    public void notifyStatusChange(Complaint complaint, String smsText) {
        sendSms(complaint.getCitizenPhone(), complaint, smsText, "Status update");
    }

    @Async
    public void notifySlaBreached(Complaint complaint) {
        String message = "GramaNiti ALERT: புகார் " + complaint.getComplaintNumber()
                + " கால அவகாசம் தாண்டியுள்ளது. உடனடி நடவடிக்கை தேவை.";

        // Notify citizen
        sendSms(complaint.getCitizenPhone(), complaint, message, "SLA breach alert");

        // Log in-app notification for ward member
        saveInAppNotification(complaint, message);
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
        } catch (Exception e) {
            notification.setStatus("FAILED");
            notification.setErrorMessage(e.getMessage());
            log.error("SMS failed for {}: {}", toPhone, e.getMessage());
        }

        notificationRepository.save(notification);
    }

    private void saveInAppNotification(Complaint complaint, String message) {
        Notification notification = Notification.builder()
                .complaintId(complaint.getId())
                .recipientId(complaint.getWardMemberId())
                .channel("IN_APP")
                .message(message)
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }
}
