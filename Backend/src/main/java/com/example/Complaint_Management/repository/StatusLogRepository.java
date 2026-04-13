package com.example.Complaint_Management.repository;


import com.example.Complaint_Management.entity.StatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StatusLogRepository extends JpaRepository<StatusLog, UUID> {
    List<StatusLog> findByComplaintIdOrderByChangedAtAsc(UUID complaintId);
}
