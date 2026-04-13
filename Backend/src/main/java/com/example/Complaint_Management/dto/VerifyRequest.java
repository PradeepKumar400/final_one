package com.example.Complaint_Management.dto;


import com.example.Complaint_Management.enums.Priority;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

// Admin: verify a complaint
@Data
public class VerifyRequest {
    private boolean approved;
    private String rejectionReason; // required if approved = false
    private Priority priority;
}

// Admin: assign technician
@Data
class AssignRequest {
    @NotNull
    private UUID technicianId;
    private String technicianName;
    private String remarks;
}

// Ward member: update progress
@Data
class ProgressUpdateRequest {
    @NotNull
    private String status; // IN_PROGRESS or RESOLVED
    private String remarks;
}

// Citizen: rate after resolution
@Data
class RatingRequest {
    @Min(1) @Max(5)
    private int rating;
    private String feedback;
}

// Add a comment
@Data
class AddCommentRequest {
    @NotNull
    private String message;
    private boolean isPublic = true;
}

// Analytics filter
@Data
class AnalyticsRequest {
    private String wardId;
    private String fromDate;
    private String toDate;
}
