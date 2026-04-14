package com.example.Complaint_Management.controller;



import com.example.Complaint_Management.dto.*;
import com.example.Complaint_Management.dto.Request.AddCommentRequest;
import com.example.Complaint_Management.dto.Request.ComplaintCreateRequest;
import com.example.Complaint_Management.dto.Response.ApiResponse;
import com.example.Complaint_Management.dto.Response.PagedResponse;
import com.example.Complaint_Management.dto.Response.AnalyticsResponse;
import com.example.Complaint_Management.enums.ComplaintStatus;
import com.example.Complaint_Management.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

/**
 * Public read-only endpoints — no authentication required.
 * Also exposes an open complaint-submission endpoint so the frontend
 * can operate without a login/register flow.
 */
@RestController
@RequestMapping("/api/v1/complaints/public")
@RequiredArgsConstructor
public class PublicComplaintController {

    private final ComplaintService complaintService;

    @Value("${app.upload.dir:./uploads/complaints}")
    private String localUploadDir;

    /**
     * POST /api/v1/complaints/public/submit
     * Submit a complaint without authentication.
     * citizenName & citizenPhone are passed in the request body as optional extras.
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<ComplaintResponse>> submitPublic(
            @Valid @RequestBody PublicComplaintSubmitRequest request) {

        // Use a deterministic guest UUID derived from name so complaints group nicely
        UUID guestId = UUID.nameUUIDFromBytes(
                (request.getCitizenName() != null ? request.getCitizenName() : "guest").getBytes());

        ComplaintResponse response = complaintService.createComplaint(
                request.toCreateRequest(),
                guestId,
                request.getCitizenName() != null ? request.getCitizenName() : "Anonymous",
                request.getCitizenPhone());

        return ResponseEntity.ok(ApiResponse.success(
                "Complaint submitted. Number: " + response.getComplaintNumber(), response));
    }

    /**
     * GET /api/v1/complaints/public/list
     * Paginated list of ALL complaints (any status) — for the Complaints page.
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintResponse>>> list(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ComplaintResponse> result =
                complaintService.getAllComplaints(null, null, null, null, null, null, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/v1/complaints/public/track/{complaintNumber}
     * Anyone can track by complaint number.
     */
    @GetMapping("/track/{complaintNumber}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> track(
            @PathVariable String complaintNumber) {
        return ResponseEntity.ok(
                ApiResponse.success(complaintService.getComplaintByNumber(complaintNumber)));
    }

    /**
     * GET /api/v1/complaints/public/ward/{wardId}
     * Public feed of resolved complaints in a ward — for transparency.
     */
    @GetMapping("/ward/{wardId}")
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintResponse>>> publicFeed(
            @PathVariable String wardId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ComplaintResponse> feed = complaintService
                .getWardComplaints(wardId, ComplaintStatus.CLOSED, pageable);
        return ResponseEntity.ok(ApiResponse.success(feed));
    }

    /**
     * GET /api/v1/complaints/public/stats/{wardId}
     * Simple stats card for a ward's public page.
     */
    @GetMapping("/stats/{wardId}")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> wardStats(
            @PathVariable String wardId) {
        return ResponseEntity.ok(ApiResponse.success(
                complaintService.getAnalytics(wardId, null, null)));
    }

    /**
     * POST /api/v1/complaints/public/{id}/comment
     * Anyone can post a follow-up comment.
     */
    @PostMapping("/{id}/comment")
    public ResponseEntity<ApiResponse<ComplaintResponse>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody AddCommentRequest request) {

        ComplaintResponse response = complaintService.addComment(
                id, request,
                UUID.randomUUID(), "Anonymous Citizen", "CITIZEN");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/v1/complaints/public/{id}/photos
     * Publicly upload photos for a complaint (e.g. at submission time).
     */
    @PostMapping(value = "/{id}/photos", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ComplaintResponse>> uploadPhotos(
            @PathVariable UUID id,
            @RequestParam("files") java.util.List<org.springframework.web.multipart.MultipartFile> files) {

        // Use a generic uploader ID for public uploads
        UUID publicId = UUID.fromString("00000000-0000-0000-0000-000000000000");
        ComplaintResponse response = complaintService.uploadPhotos(
                id, files, publicId, "Public Citizen", "BEFORE");

        return ResponseEntity.ok(ApiResponse.success("Photos uploaded", response));
    }

    /**
     * GET /api/v1/complaints/public/photos/{fileName}
     * Proxy for serving local photos if Cloudinary wasn't used.
     */
    @GetMapping("/photos/{fileName}")
    public ResponseEntity<Resource> servePhoto(@PathVariable String fileName) {
        try {
            java.nio.file.Path root = java.nio.file.Paths.get(localUploadDir)
                    .toAbsolutePath().normalize();
            java.nio.file.Path file = root.resolve(fileName).normalize();

            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "image/jpeg";
                if (fileName.endsWith(".png"))  contentType = "image/png";
                if (fileName.endsWith(".webp")) contentType = "image/webp";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // ── Inner DTO (keeps the request self-contained) ───────────────────────────

    @lombok.Data
    public static class PublicComplaintSubmitRequest {
        // Complaint fields
        @jakarta.validation.constraints.NotNull(message = "type is required")
        private com.example.Complaint_Management.enums.ComplaintType type;

        @jakarta.validation.constraints.NotBlank(message = "description is required")
        private String description;

        @jakarta.validation.constraints.NotBlank(message = "wardId is required")
        private String wardId;

        private String locationDescription;
        private Double latitude;
        private Double longitude;

        // Citizen identity (optional — caller may be anonymous)
        private String citizenName;
        private String citizenPhone;

        public ComplaintCreateRequest toCreateRequest() {
            ComplaintCreateRequest r = new ComplaintCreateRequest();
            r.setType(this.type);
            r.setDescription(this.description);
            r.setWardId(this.wardId);
            r.setLocationDescription(this.locationDescription);
            r.setLatitude(this.latitude);
            r.setLongitude(this.longitude);
            return r;
        }
    }
}