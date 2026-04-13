package com.example.Complaint_Management.repository;


import com.example.Complaint_Management.entity.Complaint;
import com.example.Complaint_Management.enums.ComplaintStatus;
import com.example.Complaint_Management.enums.ComplaintType;
import com.example.Complaint_Management.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    Optional<Complaint> findByComplaintNumber(String complaintNumber);

    // Citizen: their own complaints
    Page<Complaint> findByCitizenIdOrderByCreatedAtDesc(UUID citizenId, Pageable pageable);

    // Ward member: complaints in their ward
    Page<Complaint> findByWardIdOrderByCreatedAtDesc(String wardId, Pageable pageable);

    // Ward member: by status in their ward
    Page<Complaint> findByWardIdAndStatusOrderByCreatedAtDesc(
            String wardId, ComplaintStatus status, Pageable pageable);

    // Admin: filter by type, status, priority
    @Query("""
        SELECT c FROM Complaint c
        WHERE (:wardId IS NULL OR c.wardId = :wardId)
          AND (:status IS NULL OR c.status = :status)
          AND (:type IS NULL OR c.type = :type)
          AND (:priority IS NULL OR c.priority = :priority)
          AND (:fromDate IS NULL OR c.createdAt >= :fromDate)
          AND (:toDate IS NULL OR c.createdAt <= :toDate)
        ORDER BY c.createdAt DESC
        """)
    Page<Complaint> findWithFilters(
            @Param("wardId") String wardId,
            @Param("status") ComplaintStatus status,
            @Param("type") ComplaintType type,
            @Param("priority") Priority priority,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);

    // SLA breach candidates
    @Query("""
        SELECT c FROM Complaint c
        WHERE c.slaDeadline < :now
          AND c.isSlaBreached = false
          AND c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')
        """)
    List<Complaint> findSlaBreachedComplaints(@Param("now") LocalDateTime now);

    // Analytics queries
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.wardId = :wardId AND c.createdAt >= :from AND c.createdAt <= :to")
    Long countByWardAndDateRange(@Param("wardId") String wardId,
                                  @Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to);

    @Query("SELECT c.type, COUNT(c) FROM Complaint c WHERE c.wardId = :wardId GROUP BY c.type")
    List<Object[]> countByTypeForWard(@Param("wardId") String wardId);

    @Query("SELECT c.type, COUNT(c) FROM Complaint c GROUP BY c.type")
    List<Object[]> countByTypeGlobal();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countByStatus();

    @Query(value = """
        SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at))
        FROM complaints
        WHERE status IN ('RESOLVED','CLOSED')
          AND ward_id = :wardId
        """, nativeQuery = true)
    Double avgResolutionHoursForWard(@Param("wardId") String wardId);

    @Query(value = """
        SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at))
        FROM complaints
        WHERE status IN ('RESOLVED','CLOSED')
        """, nativeQuery = true)
    Double avgResolutionHoursGlobal();

    // Assigned to technician
    Page<Complaint> findByAssignedToIdAndStatusNotIn(
            UUID technicianId, List<ComplaintStatus> excludeStatuses, Pageable pageable);

    // Count unread for ward member
    Long countByWardIdAndStatus(String wardId, ComplaintStatus status);
}
