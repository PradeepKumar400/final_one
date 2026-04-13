package com.example.Complaint_Management.controller;


import com.example.Complaint_Management.dto.*;
import com.example.Complaint_Management.dto.Response.*;
import com.example.Complaint_Management.dto.Request.*;
import com.example.Complaint_Management.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
@RequestMapping("/api/v1/complaints/citizen")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CITIZEN')")
public class CitizenComplaintController {

    private final ComplaintService complaintService;

    /**
     * POST /api/v1/complaints/citizen
     * Submit a new complaint
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ComplaintResponse>> submitComplaint(
            @Valid @RequestBody ComplaintCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Extract citizen info from JWT principal (your auth module provides this)
        UUID citizenId = extractId(userDetails);
        String citizenName = userDetails.getUsername();
        String citizenPhone = extractPhone(userDetails);

        ComplaintResponse response = complaintService.createComplaint(
                request, citizenId, citizenName, citizenPhone);

        return ResponseEntity.ok(ApiResponse.success(
                "Complaint submitted successfully. Your complaint number: " + response.getComplaintNumber(), response));
    }

    /**
     * GET /api/v1/complaints/citizen/my
     * Get all complaints filed by this citizen
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintResponse>>> myComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ComplaintResponse> result = complaintService
                .getCitizenComplaints(extractId(userDetails), pageable);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/v1/complaints/citizen/{id}
     * View complaint detail by UUID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getComplaintById(id)));
    }

    /**
     * GET /api/v1/complaints/citizen/track/{complaintNumber}
     * Track by complaint number (e.g. CMP-2024-00042)
     */
    @GetMapping("/track/{complaintNumber}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> track(
            @PathVariable String complaintNumber) {
        return ResponseEntity.ok(
                ApiResponse.success(complaintService.getComplaintByNumber(complaintNumber)));
    }

    /**
     * POST /api/v1/complaints/citizen/{id}/photos
     * Upload before-photos with the complaint
     */
    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ComplaintResponse>> uploadPhotos(
            @PathVariable UUID id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.uploadPhotos(
                id, files, extractId(userDetails), userDetails.getUsername(), "BEFORE");

        return ResponseEntity.ok(ApiResponse.success("Photos uploaded", response));
    }

    /**
     * POST /api/v1/complaints/citizen/{id}/rate
     * Rate complaint after resolution (1–5 stars)
     */
    @PostMapping("/{id}/rate")
    public ResponseEntity<ApiResponse<ComplaintResponse>> rate(
            @PathVariable UUID id,
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.rateComplaint(
                id, extractId(userDetails), request);

        return ResponseEntity.ok(ApiResponse.success(
                "Thank you for your feedback!", response));
    }

    /**
     * POST /api/v1/complaints/citizen/{id}/comment
     * Add a public comment / follow-up note
     */
    @PostMapping("/{id}/comment")
    public ResponseEntity<ApiResponse<ComplaintResponse>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ComplaintResponse response = complaintService.addComment(
                id, request, extractId(userDetails), userDetails.getUsername(), "CITIZEN");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    // Adapt these to match how your auth module stores user info in UserDetails

    private UUID extractId(UserDetails userDetails) {
        // If your UserDetails impl has getId(), cast it.
        // Fallback: use username as UUID (adjust to your auth module)
        try {
            if (userDetails instanceof com.example.Complaint_Management.config.CustomUserDetails cud) {
                return cud.getId();
            }
        } catch (Exception ignored) {}
        return UUID.nameUUIDFromBytes(userDetails.getUsername().getBytes());
    }

    private String extractPhone(UserDetails userDetails) {
        try {
            if (userDetails instanceof com.example.Complaint_Management.config.CustomUserDetails cud) {
                return cud.getPhone();
            }
        } catch (Exception ignored) {}
        return null;
    }
}
