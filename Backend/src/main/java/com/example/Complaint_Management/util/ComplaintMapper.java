package com.example.Complaint_Management.util;

import com.example.Complaint_Management.dto.ComplaintResponse;
import com.example.Complaint_Management.entity.Complaint;
import com.example.Complaint_Management.entity.ComplaintComment;
import com.example.Complaint_Management.entity.ComplaintPhoto;
import com.example.Complaint_Management.entity.StatusLog;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ComplaintMapper {

    /**
     * Public / citizen view — only public comments, hides citizen phone.
     */
    public ComplaintResponse toResponse(Complaint c) {
        return buildBase(c)
                .citizenPhone(null)          // hidden from citizens
                .comments(mapComments(c.getComments(), false))
                .build();
    }

    /**
     * Admin / ward member view — includes all comments (public + internal),
     * citizen phone, rejection reason, and assigned technician ID.
     */
    public ComplaintResponse toFullResponse(Complaint c) {
        return buildBase(c)
                .citizenPhone(c.getCitizenPhone())
                .rejectionReason(c.getRejectionReason())
                .assignedToId(c.getAssignedToId())
                .comments(mapComments(c.getComments(), true))
                .build();
    }

    // ── Shared base builder ──────────────────────────────────────────────────

    private ComplaintResponse.ComplaintResponseBuilder buildBase(Complaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .complaintNumber(c.getComplaintNumber())
                .type(c.getType())
                .description(c.getDescription())
                .wardId(c.getWardId())
                .wardName(c.getWardName())
                .status(c.getStatus())
                .priority(c.getPriority())
                .citizenId(c.getCitizenId())
                .citizenName(c.getCitizenName())
                .locationDescription(c.getLocationDescription())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .assignedToName(c.getAssignedToName())
                .slaDeadline(c.getSlaDeadline())
                .isSlaBreached(c.getIsSlaBreached())
                .resolutionNotes(c.getResolutionNotes())
                .citizenRating(c.getCitizenRating())
                .citizenFeedback(c.getCitizenFeedback())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .resolvedAt(c.getResolvedAt())
                .photos(mapPhotos(c.getPhotos()))
                .statusHistory(mapStatusHistory(c.getStatusHistory()));
    }

    // ── Sub-mappers ──────────────────────────────────────────────────────────

    private List<ComplaintResponse.PhotoDto> mapPhotos(List<ComplaintPhoto> photos) {
        if (photos == null) return List.of();
        return photos.stream().map(p -> ComplaintResponse.PhotoDto.builder()
                .id(p.getId())
                .url(p.getUrl())
                .photoStage(p.getPhotoStage())
                .uploadedByName(p.getUploadedByName())
                .createdAt(p.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    private List<ComplaintResponse.StatusLogDto> mapStatusHistory(List<StatusLog> logs) {
        if (logs == null) return List.of();
        return logs.stream().map(s -> ComplaintResponse.StatusLogDto.builder()
                .oldStatus(s.getOldStatus())
                .newStatus(s.getNewStatus())
                .changedByName(s.getChangedByName())
                .changedByRole(s.getChangedByRole())
                .remarks(s.getRemarks())
                .changedAt(s.getChangedAt())
                .build()).collect(Collectors.toList());
    }

    /**
     * @param includeInternal if true, return all comments; if false, public-only.
     */
    private List<ComplaintResponse.CommentDto> mapComments(
            List<ComplaintComment> comments, boolean includeInternal) {
        if (comments == null) return List.of();
        return comments.stream()
                .filter(cm -> includeInternal || Boolean.TRUE.equals(cm.getIsPublic()))
                .map(cm -> ComplaintResponse.CommentDto.builder()
                        .id(cm.getId())
                        .message(cm.getMessage())
                        .authorName(cm.getAuthorName())
                        .authorRole(cm.getAuthorRole())
                        .isPublic(cm.getIsPublic())
                        .createdAt(cm.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
