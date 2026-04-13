package com.example.Complaint_Management.dto.Request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
 
import java.util.UUID;
 
@Data
public class AssignRequest {
    @NotNull(message = "Technician ID is required")
    private UUID technicianId;
    private String technicianName;
    private String remarks;
}
