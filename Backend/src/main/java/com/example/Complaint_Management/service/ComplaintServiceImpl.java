package com.example.Complaint_Management.service;

import com.example.Complaint_Management.dto.ComplaintResponse;
import com.example.Complaint_Management.dto.Request.*;
import com.example.Complaint_Management.dto.Response.*;
import com.example.Complaint_Management.entity.*;
import com.example.Complaint_Management.enums.ComplaintStatus;
import com.example.Complaint_Management.enums.ComplaintType;
import com.example.Complaint_Management.enums.Priority;
import com.example.Complaint_Management.exception.ComplaintNotFoundException;
import com.example.Complaint_Management.exception.InvalidOperationException;
import com.example.Complaint_Management.repository.*;
import com.example.Complaint_Management.util.ComplaintMapper;
import com.example.Complaint_Management.util.ComplaintNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StatusLogRepository statusLogRepository;
    private final ComplaintPhotoRepository photoRepository;
    private final ComplaintCommentRepository commentRepository;
    private final NotificationService notificationService;
    private final PhotoService photoService;
    private final ComplaintMapper complaintMapper;
    private final ComplaintNumberGenerator numberGenerator;
    private final UserRepository userRepository;

    @Value("${app.complaint.sla.urgent-hours:24}")
    private int urgentSlaHours;

    @Value("${app.complaint.sla.normal-hours:72}")
    private int normalSlaHours;

    @Value("${app.complaint.sla.low-hours:168}")
    private int lowSlaHours;

    // ─── CITIZEN ACTIONS ──────────────────────────────────────────────────────

    @Override
    public ComplaintResponse createComplaint(ComplaintCreateRequest request,
                                              UUID citizenId, String citizenName, String citizenPhone) {
        String complaintNumber = numberGenerator.generate();

        Complaint complaint = Complaint.builder()
                .complaintNumber(complaintNumber)
                .type(request.getType())
                .description(request.getDescription())
                .wardId(request.getWardId().toUpperCase().trim())
                .citizenId(citizenId)
                .citizenName(citizenName)
                .citizenPhone(citizenPhone)
                .locationDescription(request.getLocationDescription())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(ComplaintStatus.NEW)
                .priority(Priority.NORMAL)
                .slaDeadline(LocalDateTime.now().plusHours(normalSlaHours))
                .build();

        // SCENARIO LOGIC: Auto-routing to Ward Member
        String normalizedWardId = request.getWardId().toUpperCase().trim();
        userRepository.findByWardIdAndRole(normalizedWardId, com.example.Complaint_Management.enums.Role.WARD_MEMBER)
                .ifPresent(wardMember -> {
                    complaint.setWardMemberId(wardMember.getId());
                    log.info("Auto-assigned complaint {} to ward member {} for Ward {}", 
                            complaintNumber, wardMember.getFullName(), normalizedWardId);
                });

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Log initial status
        logStatusChange(savedComplaint, null, ComplaintStatus.NEW,
                citizenId, citizenName, "CITIZEN", "Complaint submitted");

        // Notify ward member and admin
        notificationService.notifyNewComplaint(savedComplaint);

        log.info("New complaint created: {} by citizen: {}", complaintNumber, citizenName);
        return complaintMapper.toResponse(savedComplaint);
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(UUID id) {
        Complaint complaint = findComplaint(id);
        return complaintMapper.toResponse(complaint);
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintByNumber(String complaintNumber) {
        Complaint complaint = complaintRepository.findByComplaintNumber(complaintNumber)
                .orElseThrow(() -> new ComplaintNotFoundException(
                        "Complaint not found: " + complaintNumber));
        return complaintMapper.toResponse(complaint);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ComplaintResponse> getCitizenComplaints(UUID citizenId, Pageable pageable) {
        Page<Complaint> page = complaintRepository
                .findByCitizenIdOrderByCreatedAtDesc(citizenId, pageable);
        return toPagedResponse(page);
    }

    @Override
    public ComplaintResponse rateComplaint(UUID complaintId, UUID citizenId, RatingRequest request) {
        Complaint complaint = findComplaint(complaintId);

        if (!complaint.getCitizenId().equals(citizenId)) {
            throw new InvalidOperationException("You can only rate your own complaints");
        }
        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new InvalidOperationException("Complaint must be resolved before rating");
        }

        complaint.setCitizenRating(request.getRating());
        complaint.setCitizenFeedback(request.getFeedback());
        complaint.setStatus(ComplaintStatus.CLOSED);
        complaint.setClosedAt(LocalDateTime.now());

        logStatusChange(complaint, ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED,
                citizenId, "Citizen", "CITIZEN", "Citizen rated and closed complaint");

        complaint = complaintRepository.save(complaint);
        log.info("Complaint {} closed with rating {}", complaint.getComplaintNumber(), request.getRating());
        return complaintMapper.toResponse(complaint);
    }

    // ─── PHOTO UPLOAD ─────────────────────────────────────────────────────────

    @Override
    public ComplaintResponse uploadPhotos(UUID complaintId, List<MultipartFile> files,
                                          UUID uploaderId, String uploaderName, String stage) {
        Complaint complaint = findComplaint(complaintId);

        for (MultipartFile file : files) {
            PhotoService.UploadResult result = photoService.upload(file,
                    "complaints/" + complaintId + "/" + stage.toLowerCase());

            ComplaintPhoto photo = ComplaintPhoto.builder()
                    .complaint(complaint)
                    .url(result.getUrl())
                    .publicId(result.getPublicId())
                    .photoStage(stage.toUpperCase())
                    .uploadedById(uploaderId)
                    .uploadedByName(uploaderName)
                    .build();

            complaint.getPhotos().add(photo);
        }

        complaint = complaintRepository.save(complaint);
        log.info("{} photo(s) uploaded for complaint {}", files.size(), complaint.getComplaintNumber());
        return complaintMapper.toResponse(complaint);
    }

    // ─── WARD MEMBER ACTIONS ──────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ComplaintResponse> getWardComplaints(String wardId,
                                                               ComplaintStatus status,
                                                               Pageable pageable) {
        String normalizedWardId = wardId.toUpperCase().trim();
        Page<Complaint> page = (status != null)
                ? complaintRepository.findByWardIdAndStatusOrderByCreatedAtDesc(normalizedWardId, status, pageable)
                : complaintRepository.findByWardIdOrderByCreatedAtDesc(normalizedWardId, pageable);
        return toPagedResponseFull(page);
    }

    @Override
    public ComplaintResponse acknowledgeComplaint(UUID complaintId,
                                                   UUID wardMemberId, String wardMemberName) {
        Complaint complaint = findComplaint(complaintId);
        validateTransition(complaint, ComplaintStatus.NEW, ComplaintStatus.PENDING_REVIEW);

        ComplaintStatus old = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.PENDING_REVIEW);
        complaint.setWardMemberId(wardMemberId);

        logStatusChange(complaint, old, ComplaintStatus.PENDING_REVIEW,
                wardMemberId, wardMemberName, "WARD_MEMBER", "Acknowledged by ward member");

        complaint = complaintRepository.save(complaint);

        notificationService.notifyStatusChange(complaint,
                "உங்கள் புகார் (" + complaint.getComplaintNumber() + ") வார்டு உறுப்பினரால் பெறப்பட்டது.");

        return complaintMapper.toFullResponse(complaint);
    }

    @Override
    public ComplaintResponse verifyByWardMember(UUID complaintId, VerifyRequest request, UUID wardMemberId, String wardMemberName) {
        Complaint complaint = findComplaint(complaintId);
        // Ward member can verify directly from NEW or after Acknowledgment (PENDING_REVIEW)
        validateTransition(complaint, ComplaintStatus.NEW, ComplaintStatus.PENDING_REVIEW);

        ComplaintStatus old = complaint.getStatus();
        
        if (request.isApproved()) {
            complaint.setStatus(ComplaintStatus.VERIFIED);
            
            logStatusChange(complaint, old, ComplaintStatus.VERIFIED,
                    wardMemberId, wardMemberName, "WARD_MEMBER", "Verified by ward member");
            
            notificationService.notifyStatusChange(complaint,
                "உங்கள் புகார் (" + complaint.getComplaintNumber() + ") வார்டு உறுப்பினரால் சரிபார்க்கப்பட்டது.");
        } else {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new InvalidOperationException("Rejection reason is required");
            }
            complaint.setStatus(ComplaintStatus.REJECTED);
            complaint.setRejectionReason(request.getRejectionReason());

            logStatusChange(complaint, old, ComplaintStatus.REJECTED,
                    wardMemberId, wardMemberName, "WARD_MEMBER", request.getRejectionReason());

            notificationService.notifyStatusChange(complaint,
                    "உங்கள் புகார் (" + complaint.getComplaintNumber() + ") நிராகரிக்கப்பட்டது: "
                            + request.getRejectionReason());
        }

        complaint = complaintRepository.save(complaint);
        return complaintMapper.toFullResponse(complaint);
    }

    @Override
    public ComplaintResponse updateProgress(UUID complaintId, ProgressUpdateRequest request,
                                            UUID actorId, String actorName, String role) {
        Complaint complaint = findComplaint(complaintId);

        ComplaintStatus newStatus;
        try {
            newStatus = ComplaintStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new InvalidOperationException("Invalid status: " + request.getStatus());
        }

        // ASSIGNED → IN_PROGRESS or IN_PROGRESS → RESOLVED only
        if (newStatus != ComplaintStatus.IN_PROGRESS && newStatus != ComplaintStatus.RESOLVED) {
            throw new InvalidOperationException(
                    "updateProgress only supports IN_PROGRESS or RESOLVED");
        }

        ComplaintStatus old = complaint.getStatus();
        complaint.setStatus(newStatus);

        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
            complaint.setResolutionNotes(request.getResolutionNotes());
        }

        logStatusChange(complaint, old, newStatus, actorId, actorName, role, request.getRemarks());
        complaint = complaintRepository.save(complaint);

        String smsMessage = newStatus == ComplaintStatus.RESOLVED
                ? "உங்கள் புகார் (" + complaint.getComplaintNumber() + ") தீர்க்கப்பட்டது. தயவுசெய்து மதிப்பீடு செய்யுங்கள்."
                : "உங்கள் புகார் (" + complaint.getComplaintNumber() + ") செயலில் உள்ளது.";

        notificationService.notifyStatusChange(complaint, smsMessage);
        return complaintMapper.toFullResponse(complaint);
    }

    @Override
    public ComplaintResponse addComment(UUID complaintId, AddCommentRequest request,
                                        UUID authorId, String authorName, String role) {
        Complaint complaint = findComplaint(complaintId);

        ComplaintComment comment = ComplaintComment.builder()
                .complaint(complaint)
                .message(request.getMessage())
                .authorId(authorId)
                .authorName(authorName)
                .authorRole(role)
                .isPublic(request.isPublic())
                .build();

        complaint.getComments().add(comment);
        complaint = complaintRepository.save(complaint);

        // Admin and ward member callers get full view (all comments)
        boolean isPrivileged = "ADMIN".equals(role) || "WARD_MEMBER".equals(role);
        return isPrivileged
                ? complaintMapper.toFullResponse(complaint)
                : complaintMapper.toResponse(complaint);
    }

    // ─── ADMIN ACTIONS ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ComplaintResponse> getAllComplaints(String wardId, ComplaintStatus status,
                                                             ComplaintType type, Priority priority,
                                                             String fromDate, String toDate,
                                                             Pageable pageable) {
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime from = (fromDate != null) ? LocalDateTime.parse(fromDate, fmt) : null;
        LocalDateTime to = (toDate != null) ? LocalDateTime.parse(toDate, fmt) : null;

        Page<Complaint> page = complaintRepository.findWithFilters(
                wardId, status, type, priority, from, to, pageable);
        return toPagedResponseFull(page);
    }

    @Override
    public ComplaintResponse verifyComplaint(UUID complaintId, VerifyRequest request,
                                              UUID adminId, String adminName) {
        Complaint complaint = findComplaint(complaintId);

        ComplaintStatus old = complaint.getStatus();

        if (request.isApproved()) {
            complaint.setStatus(ComplaintStatus.VERIFIED);
            complaint.setVerifiedById(adminId);

            if (request.getPriority() != null) {
                complaint.setPriority(request.getPriority());
                // Reset SLA deadline based on new priority
                int slaHours = switch (request.getPriority()) {
                    case URGENT -> urgentSlaHours;
                    case NORMAL -> normalSlaHours;
                    case LOW    -> lowSlaHours;
                };
                complaint.setSlaDeadline(LocalDateTime.now().plusHours(slaHours));
            }

            logStatusChange(complaint, old, ComplaintStatus.VERIFIED,
                    adminId, adminName, "ADMIN", "Verified and approved");

            notificationService.notifyStatusChange(complaint,
                    "உங்கள் புகார் (" + complaint.getComplaintNumber() + ") சரிபார்க்கப்பட்டது. விரைவில் நடவடிக்கை எடுக்கப்படும்.");
        } else {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new InvalidOperationException("Rejection reason is required");
            }
            complaint.setStatus(ComplaintStatus.REJECTED);
            complaint.setRejectionReason(request.getRejectionReason());

            logStatusChange(complaint, old, ComplaintStatus.REJECTED,
                    adminId, adminName, "ADMIN", request.getRejectionReason());

            notificationService.notifyStatusChange(complaint,
                    "உங்கள் புகார் (" + complaint.getComplaintNumber() + ") நிராகரிக்கப்பட்டது: "
                            + request.getRejectionReason());
        }

        complaint = complaintRepository.save(complaint);
        return complaintMapper.toFullResponse(complaint);
    }

    @Override
    public ComplaintResponse assignTechnician(UUID complaintId, AssignRequest request,
                                               UUID adminId, String adminName) {
        Complaint complaint = findComplaint(complaintId);

        if (complaint.getStatus() != ComplaintStatus.VERIFIED) {
            throw new InvalidOperationException(
                    "Complaint must be verified before assigning a technician");
        }

        ComplaintStatus old = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint.setAssignedToId(request.getTechnicianId());
        complaint.setAssignedToName(request.getTechnicianName());

        logStatusChange(complaint, old, ComplaintStatus.ASSIGNED,
                adminId, adminName, "ADMIN",
                "Assigned to: " + request.getTechnicianName()
                        + (request.getRemarks() != null ? " - " + request.getRemarks() : ""));

        complaint = complaintRepository.save(complaint);

        notificationService.notifyStatusChange(complaint,
                "உங்கள் புகார் (" + complaint.getComplaintNumber() + ") "
                        + request.getTechnicianName() + " அவர்களுக்கு ஒதுக்கப்பட்டது.");

        return complaintMapper.toFullResponse(complaint);
    }

    @Override
    public ComplaintResponse escalateComplaint(UUID complaintId,
                                                UUID adminId, String adminName, String reason) {
        Complaint complaint = findComplaint(complaintId);
        ComplaintStatus old = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.ESCALATED);
        complaint.setIsSlaBreached(true);

        logStatusChange(complaint, old, ComplaintStatus.ESCALATED,
                adminId, adminName, "ADMIN", "Escalated: " + reason);

        complaint = complaintRepository.save(complaint);

        notificationService.notifyStatusChange(complaint,
                "உங்கள் புகார் (" + complaint.getComplaintNumber() + ") உயர் அலுவலர்களுக்கு அனுப்பப்பட்டது.");

        return complaintMapper.toFullResponse(complaint);
    }

    // ─── ANALYTICS ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(String wardId, String fromDate, String toDate) {
        List<Object[]> byStatus = complaintRepository.countByStatus();
        Map<String, Long> statusMap = toMap(byStatus);

        long total = statusMap.values().stream().mapToLong(Long::longValue).sum();
        long resolved = statusMap.getOrDefault("RESOLVED", 0L)
                + statusMap.getOrDefault("CLOSED", 0L);
        long slaBreached = complaintRepository
                .findSlaBreachedComplaints(LocalDateTime.now()).size();

        double avgHours = 0;

        if (wardId != null && !wardId.isBlank()) {
            Double avg = complaintRepository.avgResolutionHoursForWard(wardId);
            avgHours = avg != null ? avg : 0;
        } else {
            Double avg = complaintRepository.avgResolutionHoursGlobal();
            avgHours = avg != null ? avg : 0;
        }

        // byType: ward-specific or global
        List<Object[]> typeRows = (wardId != null && !wardId.isBlank())
                ? complaintRepository.countByTypeForWard(wardId)
                : complaintRepository.countByTypeGlobal();
        Map<String, Long> byType = toMap(typeRows);

        return AnalyticsResponse.builder()
                .totalComplaints(total)
                .openComplaints(total - resolved)
                .resolvedComplaints(resolved)
                .slaBreachedCount(slaBreached)
                .avgResolutionHours(Math.round(avgHours * 10.0) / 10.0)
                .resolutionRate(total > 0 ? Math.round((resolved * 100.0 / total) * 10.0) / 10.0 : 0)
                .byStatus(statusMap)
                .byType(byType)
                .build();
    }

    // ─── SCHEDULED JOBS ──────────────────────────────────────────────────────

    @Override
    @Scheduled(fixedRateString = "PT1H") // Every hour
    public void checkAndMarkSlaBreaches() {
        List<Complaint> breached = complaintRepository
                .findSlaBreachedComplaints(LocalDateTime.now());

        for (Complaint c : breached) {
            c.setIsSlaBreached(true);
            logStatusChange(c, c.getStatus(), ComplaintStatus.ESCALATED,
                    null, "System", "SYSTEM", "SLA deadline breached — auto escalated");
            c.setStatus(ComplaintStatus.ESCALATED);
            complaintRepository.save(c);
            notificationService.notifySlaBreached(c);
        }

        if (!breached.isEmpty()) {
            log.warn("SLA breach: {} complaint(s) auto-escalated", breached.size());
        }
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private Complaint findComplaint(UUID id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found: " + id));
    }

    private void logStatusChange(Complaint complaint,
                                  ComplaintStatus oldStatus, ComplaintStatus newStatus,
                                  UUID actorId, String actorName, String role, String remarks) {
        StatusLog log = StatusLog.builder()
                .complaint(complaint)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedById(actorId)
                .changedByName(actorName)
                .changedByRole(role)
                .remarks(remarks)
                .build();
        complaint.getStatusHistory().add(log);
    }

    private void validateTransition(Complaint complaint,
                                     ComplaintStatus... allowedFromStatuses) {
        boolean valid = Arrays.asList(allowedFromStatuses).contains(complaint.getStatus());
        if (!valid) {
            throw new InvalidOperationException(
                    "Cannot perform this action on a complaint with status: " + complaint.getStatus());
        }
    }

    private PagedResponse<ComplaintResponse> toPagedResponse(Page<Complaint> page) {
        return PagedResponse.<ComplaintResponse>builder()
                .content(page.getContent().stream()
                        .map(complaintMapper::toResponse)
                        .collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    /** Full view (admin / ward member) — includes internal comments, phone, etc. */
    private PagedResponse<ComplaintResponse> toPagedResponseFull(Page<Complaint> page) {
        return PagedResponse.<ComplaintResponse>builder()
                .content(page.getContent().stream()
                        .map(complaintMapper::toFullResponse)
                        .collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private Map<String, Long> toMap(List<Object[]> rows) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            map.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }
        return map;
    }
}
