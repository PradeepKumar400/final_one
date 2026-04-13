package com.example.Complaint_Management.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private long totalComplaints;
    private long openComplaints;
    private long resolvedComplaints;
    private long slaBreachedCount;
    private double avgResolutionHours;
    private double resolutionRate;
    private Map<String, Long> byStatus;
    private Map<String, Long> byType;
}
