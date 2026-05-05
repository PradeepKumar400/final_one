package com.example.Complaint_Management.controller;



import com.example.Complaint_Management.dto.*;
import com.example.Complaint_Management.dto.Response.ApiResponse;
import com.example.Complaint_Management.dto.Response.PagedResponse;
import com.example.Complaint_Management.dto.Response.AnalyticsResponse;
import com.example.Complaint_Management.dto.Request.VerifyRequest;
import com.example.Complaint_Management.dto.Request.AssignRequest;
import com.example.Complaint_Management.dto.Request.AddCommentRequest;
import com.example.Complaint_Management.enums.ComplaintStatus;
import com.example.Complaint_Management.enums.ComplaintType;
import com.example.Complaint_Management.enums.Priority;
import com.example.Complaint_Management.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/complaints/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'PRESIDENT')")
public class AdminComplaintController {

    private final ComplaintService complaintService;

    /**
     * GET /api/v1/complaints/admin
     * Get all complaints with full filter support
     * Query params: wardId, status, type, priority, fromDate, toDate, page, size, sort
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintResponse>>> getAllComplaints(
            @RequestParam(required = false) String wardId,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintType type,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(ApiResponse.success(
                complaintService.getAllComplaints(wardId, status, type, priority,
                        fromDate, toDate, pageable)));
    }

    /**
     * GET /api/v1/complaints/admin/{id}
     * Full detail view for admin
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getComplaintById(id)));
    }

    /**
     * PUT /api/v1/complaints/admin/{id}/verify
     * Approve or reject a complaint, optionally set priority
     */
    @PutMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<ComplaintResponse>> verify(
            @PathVariable UUID id,
            @RequestBody VerifyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.verifyComplaint(
                id, request, extractId(userDetails), userDetails.getUsername());

        String msg = request.isApproved() ? "Complaint verified and approved" : "Complaint rejected";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    /**
     * PUT /api/v1/complaints/admin/{id}/assign
     * Assign a technician to a verified complaint
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assign(
            @PathVariable UUID id,
            @Valid @RequestBody AssignRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.assignTechnician(
                id, request, extractId(userDetails), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Technician assigned successfully", response));
    }

    /**
     * PUT /api/v1/complaints/admin/{id}/escalate
     * Manually escalate a complaint
     */
    @PutMapping("/{id}/escalate")
    public ResponseEntity<ApiResponse<ComplaintResponse>> escalate(
            @PathVariable UUID id,
            @RequestParam String reason,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.escalateComplaint(
                id, extractId(userDetails), userDetails.getUsername(), reason);
        return ResponseEntity.ok(ApiResponse.success("Complaint escalated", response));
    }

    /**
     * POST /api/v1/complaints/admin/{id}/comment
     * Add internal or public comment
     */
    @PostMapping("/{id}/comment")
    public ResponseEntity<ApiResponse<ComplaintResponse>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.addComment(
                id, request, extractId(userDetails), userDetails.getUsername(), "ADMIN");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/complaints/admin/analytics
     * Dashboard analytics — counts by type, status, SLA, avg resolution time
     */
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> analytics(
            @RequestParam(required = false) String wardId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        return ResponseEntity.ok(ApiResponse.success(
                complaintService.getAnalytics(wardId, fromDate, toDate)));
    }

    private UUID extractId(UserDetails userDetails) {
        if (userDetails instanceof com.example.Complaint_Management.config.CustomUserDetails cud) {
            return cud.getId();
        }
        return UUID.nameUUIDFromBytes(userDetails.getUsername().getBytes());
    }
}
