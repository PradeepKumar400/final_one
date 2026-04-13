package com.example.Complaint_Management.repository;

import com.example.Complaint_Management.entity.ComplaintComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintCommentRepository extends JpaRepository<ComplaintComment, UUID> {
    List<ComplaintComment> findByComplaintIdAndIsPublicTrueOrderByCreatedAtAsc(UUID complaintId);
    List<ComplaintComment> findByComplaintIdOrderByCreatedAtAsc(UUID complaintId);
}
