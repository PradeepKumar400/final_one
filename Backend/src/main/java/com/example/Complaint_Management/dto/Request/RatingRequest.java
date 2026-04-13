package com.example.Complaint_Management.dto.Request;

import jakarta.validation.constraints.*;
import lombok.Data;
 
@Data
public class RatingRequest {
    @Min(1) @Max(5)
    @NotNull(message = "Rating is required")
    private Integer rating;
    private String feedback;
}
