package com.example.Complaint_Management.entity;



import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaint_comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComplaintComment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "author_name")
    private String authorName;

    @Column(name = "author_role")
    private String authorRole;

    // true = visible to citizen, false = internal only
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
