package com.example.Complaint_Management.controller;

import com.example.Complaint_Management.entity.Notification;
import com.example.Complaint_Management.dto.Response.ApiResponse;
import com.example.Complaint_Management.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(@PathVariable UUID userId) {
        List<Notification> list = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
