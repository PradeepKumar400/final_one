package com.example.Complaint_Management.enums;

public enum ComplaintStatus {
    NEW,            // Just submitted
    PENDING_REVIEW, // Waiting for admin
    VERIFIED,       // Admin approved
    REJECTED,       // Admin rejected
    ASSIGNED,       // Technician assigned
    IN_PROGRESS,    // Work started
    RESOLVED,       // Work done
    CLOSED,         // Citizen rated and confirmed
    ESCALATED       // SLA breached → auto escalated
}
