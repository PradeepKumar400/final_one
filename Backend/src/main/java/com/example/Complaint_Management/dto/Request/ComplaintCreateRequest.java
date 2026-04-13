package com.example.Complaint_Management.dto.Request;

import com.example.Complaint_Management.enums.ComplaintType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComplaintCreateRequest {

    @NotNull(message = "Complaint type is required")
    private ComplaintType type;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Ward ID is required")
    private String wardId;

    private String locationDescription;
    private Double latitude;
    private Double longitude;
}
