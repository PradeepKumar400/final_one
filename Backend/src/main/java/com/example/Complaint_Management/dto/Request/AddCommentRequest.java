package com.example.Complaint_Management.dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
 
@Data
public class AddCommentRequest {
    @NotBlank(message = "Comment message is required")
    private String message;
    private boolean isPublic = true;
}
