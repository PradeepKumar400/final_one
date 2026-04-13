package com.example.Complaint_Management.controller;

import com.example.Complaint_Management.config.CustomUserDetails;
import com.example.Complaint_Management.dto.Response.*;
import com.example.Complaint_Management.dto.Request.*;
import com.example.Complaint_Management.dto.ComplaintResponse;
import com.example.Complaint_Management.enums.ComplaintStatus;
import com.example.Complaint_Management.exception.InvalidOperationException;
import com.example.Complaint_Management.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/complaints/ward")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('WARD_MEMBER', 'ADMIN')")
public class WardMemberController {

    private final ComplaintService complaintService;

    /**
     * GET /api/v1/complaints/ward/{wardId}
     * View all complaints for THIS ward member's ward.
     * Ward members can only see their own ward — validated server-side.
     */
    @GetMapping("/{wardId}")
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintResponse>>> getWardComplaints(
            @PathVariable String wardId,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetails userDetails) {

        enforceWardAccess(wardId, userDetails);

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(ApiResponse.success(
                complaintService.getWardComplaints(wardId, status, pageable)));
    }

    /**
     * GET /api/v1/complaints/ward/detail/{id}
     * Full detail of a specific complaint (includes internal comments).
     */
    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getComplaintById(id)));
    }

    /**
     * PUT /api/v1/complaints/ward/{id}/acknowledge
     * Acknowledge a NEW complaint — marks it as PENDING_REVIEW.
     */
    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<ComplaintResponse>> acknowledge(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.acknowledgeComplaint(
                id, extractId(userDetails), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Complaint acknowledged", response));
    }

    /**
     * PUT /api/v1/complaints/ward/{id}/progress
     * Update status to IN_PROGRESS or RESOLVED with resolution notes.
     */
    @PutMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateProgress(
            @PathVariable UUID id,
            @Valid @RequestBody ProgressUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String role = userDetails.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("WARD_MEMBER");

        ComplaintResponse response = complaintService.updateProgress(
                id, request, extractId(userDetails), userDetails.getUsername(), role);
        return ResponseEntity.ok(ApiResponse.success("Status updated", response));
    }

    /**
     * POST /api/v1/complaints/ward/{id}/photos/after
     * Upload after-work completion photos (proof of fix).
     */
    @PostMapping(value = "/{id}/photos/after", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ComplaintResponse>> uploadAfterPhotos(
            @PathVariable UUID id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.uploadPhotos(
                id, files, extractId(userDetails), userDetails.getUsername(), "AFTER");
        return ResponseEntity.ok(ApiResponse.success("After-work photos uploaded", response));
    }

    /**
     * POST /api/v1/complaints/ward/{id}/comment
     * Add a public or internal comment.
     * isPublic=true → citizen can see; isPublic=false → internal note only.
     */
    @PostMapping("/{id}/comment")
    public ResponseEntity<ApiResponse<ComplaintResponse>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String role = userDetails.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("WARD_MEMBER");

        ComplaintResponse response = complaintService.addComment(
                id, request, extractId(userDetails), userDetails.getUsername(), role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Ensure the ward member is only accessing their own ward.
     * Throws 403-equivalent if they try to access another ward's data.
     */
    private void enforceWardAccess(String requestedWardId, UserDetails userDetails) {
        if (userDetails instanceof CustomUserDetails cud && cud.getWardId() != null) {
            if (!cud.getWardId().equals(requestedWardId)) {
                throw new InvalidOperationException(
                        "Access denied: you can only view complaints in your assigned ward ("
                        + cud.getWardId() + ")");
            }
        }
    }

    private UUID extractId(UserDetails userDetails) {
        if (userDetails instanceof CustomUserDetails cud) {
            return cud.getId();
        }
        return UUID.nameUUIDFromBytes(userDetails.getUsername().getBytes());
    }
}
