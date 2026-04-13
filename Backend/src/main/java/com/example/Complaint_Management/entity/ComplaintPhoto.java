package com.example.Complaint_Management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
 
import java.time.LocalDateTime;
import java.util.UUID;
 
@Entity
@Table(name = "complaint_photos")
@Getter 
@Setter
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class ComplaintPhoto {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
 
    @Column(name = "url", nullable = false)
    private String url;
 
    @Column(name = "public_id") // Cloudinary public_id for deletion
    private String publicId;
 
    // "BEFORE" or "AFTER" — before work and after work photos
    @Column(name = "photo_stage")
    @Builder.Default
    private String photoStage = "BEFORE";
 
    @Column(name = "uploaded_by_id")
    private UUID uploadedById;
 
    @Column(name = "uploaded_by_name")
    private String uploadedByName;
 
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
