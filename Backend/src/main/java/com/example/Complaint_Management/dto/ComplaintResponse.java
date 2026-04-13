package com.example.Complaint_Management.dto;

import com.example.Complaint_Management.enums.ComplaintStatus;
import com.example.Complaint_Management.enums.ComplaintType;
import com.example.Complaint_Management.enums.Priority;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ComplaintResponse {
    private UUID id;
    private String complaintNumber;
    private ComplaintType type;
    private String description;
    private String wardId;
    private String wardName;
    private ComplaintStatus status;
    private Priority priority;

    // Citizen
    private UUID citizenId;
    private String citizenName;
    private String citizenPhone;       // visible to ward member and admin

    // Location
    private String locationDescription;
    private Double latitude;
    private Double longitude;

    // Assignment
    private UUID assignedToId;
    private String assignedToName;
    private String wardMemberName;

    // Rejection
    private String rejectionReason;    // set when status = REJECTED

    // SLA
    private LocalDateTime slaDeadline;
    private Boolean isSlaBreached;

    // Resolution
    private String resolutionNotes;
    private Integer citizenRating;
    private String citizenFeedback;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    // Photos
    private List<PhotoDto> photos;

    // Status timeline
    private List<StatusLogDto> statusHistory;

    // Comments (public-only for citizen view; all for admin/ward view)
    private List<CommentDto> comments;

    @Data @Builder
    public static class PhotoDto {
        private UUID id;
        private String url;
        private String photoStage;
        private String uploadedByName;
        private LocalDateTime createdAt;
    }

    @Data @Builder
    public static class StatusLogDto {
        private ComplaintStatus oldStatus;
        private ComplaintStatus newStatus;
        private String changedByName;
        private String changedByRole;
        private String remarks;
        private LocalDateTime changedAt;
    }

    @Data @Builder
    public static class CommentDto {
        private UUID id;
        private String message;
        private String authorName;
        private String authorRole;
        private Boolean isPublic;      // included so admin/ward UI can label internal notes
        private LocalDateTime createdAt;
    }
}
