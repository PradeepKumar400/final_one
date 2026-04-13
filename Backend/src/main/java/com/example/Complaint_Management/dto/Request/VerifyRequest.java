package com.example.Complaint_Management.dto.Request;

import com.example.Complaint_Management.enums.Priority;
import lombok.Data;
 

@Data
public class VerifyRequest {
    private boolean approved;
    private String rejectionReason;
    private Priority priority;
}
