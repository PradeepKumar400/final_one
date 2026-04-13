package com.example.Complaint_Management.entity;
import com.example.Complaint_Management.enums.ComplaintStatus;
import com.example.Complaint_Management.enums.ComplaintType;
import com.example.Complaint_Management.enums.Priority;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
 
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
 
@Entity
@Table(name = "complaints")
@Getter
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Complaint {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    // Human-readable complaint number like CMP-2024-00001
    @Column(name = "complaint_number", unique = true, nullable = false)
    private String complaintNumber;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintType type;
 
    @Column(nullable = false, length = 1000)
    private String description;
 
    @Column(name = "ward_id", nullable = false)
    private String wardId;
 
    @Column(name = "ward_name")
    private String wardName;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.NEW;
 
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Priority priority = Priority.NORMAL;
 
    // Citizen who filed
    @Column(name = "citizen_id", nullable = false)
    private UUID citizenId;
 
    @Column(name = "citizen_name")
    private String citizenName;
 
    @Column(name = "citizen_phone")
    private String citizenPhone;
 
    // Location details
    @Column(name = "location_description")
    private String locationDescription;
 
    @Column(name = "latitude")
    private Double latitude;
 
    @Column(name = "longitude")
    private Double longitude;
 
    // Assigned technician
    @Column(name = "assigned_to_id")
    private UUID assignedToId;
 
    @Column(name = "assigned_to_name")
    private String assignedToName;
 
    // Ward member handling
    @Column(name = "ward_member_id")
    private UUID wardMemberId;
 
    // Admin who verified
    @Column(name = "verified_by_id")
    private UUID verifiedById;
 
    @Column(name = "rejection_reason")
    private String rejectionReason;
 
    // SLA tracking
    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;
 
    @Column(name = "is_sla_breached")
    @Builder.Default
    private Boolean isSlaBreached = false;
 
    // Resolution
    @Column(name = "resolution_notes", length = 1000)
    private String resolutionNotes;
 
    @Column(name = "citizen_rating")
    private Integer citizenRating; // 1–5
 
    @Column(name = "citizen_feedback")
    private String citizenFeedback;
 
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
 
    @Column(name = "closed_at")
    private LocalDateTime closedAt;
 
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
 
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
 
    // Photos
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintPhoto> photos = new ArrayList<>();
 
    // Status history
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC")
    @Builder.Default
    private List<StatusLog> statusHistory = new ArrayList<>();
 
    // Comments / notes
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<ComplaintComment> comments = new ArrayList<>();
}
