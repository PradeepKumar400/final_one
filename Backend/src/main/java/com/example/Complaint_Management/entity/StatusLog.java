package com.example.Complaint_Management.entity;

import com.example.Complaint_Management.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
 
import java.time.LocalDateTime;
import java.util.UUID;
 
@Entity
@Table(name = "status_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusLog {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
 
    @Enumerated(EnumType.STRING)
    @Column(name = "old_status")
    private ComplaintStatus oldStatus;
 
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private ComplaintStatus newStatus;
 
    @Column(name = "changed_by_id")
    private UUID changedById;
 
    @Column(name = "changed_by_name")
    private String changedByName;
 
    @Column(name = "changed_by_role")
    private String changedByRole;
 
    @Column(name = "remarks", length = 500)
    private String remarks;
 
    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;
}
