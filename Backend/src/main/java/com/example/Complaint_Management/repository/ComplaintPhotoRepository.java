package com.example.Complaint_Management.repository;

import com.example.Complaint_Management.entity.ComplaintPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import java.util.List;
import java.util.UUID;
 
@Repository
public interface ComplaintPhotoRepository extends JpaRepository<ComplaintPhoto, UUID> {
    List<ComplaintPhoto> findByComplaintId(UUID complaintId);
    List<ComplaintPhoto> findByComplaintIdAndPhotoStage(UUID complaintId, String stage);
}
