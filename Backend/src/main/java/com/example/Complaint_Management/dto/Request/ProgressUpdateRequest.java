package com.example.Complaint_Management.dto.Request;

import jakarta.validation.constraints.*;
import lombok.Data;
 
@Data
public class ProgressUpdateRequest {
    @NotNull(message = "Status is required")
    private String status; // IN_PROGRESS or RESOLVED
    private String remarks;
    private String resolutionNotes;
}
