package com.example.Complaint_Management.service;


import com.example.Complaint_Management.dto.ComplaintResponse;
import com.example.Complaint_Management.dto.Request.*;
import com.example.Complaint_Management.dto.Response.*;
import com.example.Complaint_Management.dto.Response.PagedResponse;
import com.example.Complaint_Management.enums.ComplaintStatus;
import com.example.Complaint_Management.enums.ComplaintType;
import com.example.Complaint_Management.enums.Priority;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ComplaintService {

    // Citizen actions
    ComplaintResponse createComplaint(ComplaintCreateRequest request,
                                      UUID citizenId, String citizenName, String citizenPhone);

    ComplaintResponse getComplaintById(UUID id);

    ComplaintResponse getComplaintByNumber(String complaintNumber);

    PagedResponse<ComplaintResponse> getCitizenComplaints(UUID citizenId, Pageable pageable);

    ComplaintResponse rateComplaint(UUID complaintId, UUID citizenId, RatingRequest request);

    // Photo upload
    ComplaintResponse uploadPhotos(UUID complaintId, List<MultipartFile> files,
                                   UUID uploaderId, String uploaderName, String stage);

    // Ward member actions
    PagedResponse<ComplaintResponse> getWardComplaints(String wardId,
                                                        ComplaintStatus status, Pageable pageable);

    ComplaintResponse acknowledgeComplaint(UUID complaintId, UUID wardMemberId, String wardMemberName);

    ComplaintResponse verifyByWardMember(UUID complaintId, VerifyRequest request, UUID wardMemberId, String wardMemberName);

    ComplaintResponse updateProgress(UUID complaintId, ProgressUpdateRequest request,
                                     UUID wardMemberId, String wardMemberName, String role);

    ComplaintResponse addComment(UUID complaintId, AddCommentRequest request,
                                 UUID authorId, String authorName, String role);

    // Admin actions
    PagedResponse<ComplaintResponse> getAllComplaints(String wardId, ComplaintStatus status,
                                                      ComplaintType type, Priority priority,
                                                      String fromDate, String toDate,
                                                      Pageable pageable);

    ComplaintResponse verifyComplaint(UUID complaintId, VerifyRequest request,
                                      UUID adminId, String adminName);

    ComplaintResponse assignTechnician(UUID complaintId, AssignRequest request,
                                       UUID adminId, String adminName);

    ComplaintResponse escalateComplaint(UUID complaintId, UUID adminId, String adminName, String reason);

    // Analytics
    AnalyticsResponse getAnalytics(String wardId, String fromDate, String toDate);

    // Scheduled: SLA breach check
    void checkAndMarkSlaBreaches();
}
