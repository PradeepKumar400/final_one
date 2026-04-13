export const complaints = [
  {
    id: "c1",
    complaintNumber: "CMP-2025-1045",
    type: "WATER",
    description: "Low water pressure issue in Ward 4, please fix it.",
    wardId: "WARD-04",
    wardName: "Ward 4 — Nehru Street",
    status: "PENDING_REVIEW",
    priority: "URGENT",
    citizenId: "u1",
    citizenName: "Senthil Kumar",
    citizenPhone: "+91 98765 43210",
    locationDescription: "Near Murugan temple, 2nd street junction",
    latitude: 13.0827,
    longitude: 80.2707,
    assignedToName: null,
    slaDeadline: "2025-04-14T17:30:00",
    isSlaBreached: false,
    resolutionNotes: null,
    citizenRating: null,
    citizenFeedback: null,
    resolvedAt: null,
    closedAt: null,
    createdAt: "2025-04-11T17:30:00",
    updatedAt: "2025-04-11T17:32:00",
    photos: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=140&fit=crop", stage: "BEFORE" }],
    statusHistory: [
      { status: "NEW", changedByName: "Senthil Kumar", changedByRole: "CITIZEN", remarks: "Complaint submitted", timestamp: "2025-04-11T17:30:00" },
      { status: "PENDING_REVIEW", changedByName: "Ravi (Ward 4)", changedByRole: "WARD_MEMBER", remarks: "Acknowledged. Will escalate to admin.", timestamp: "2025-04-11T18:00:00" }
    ],
    comments: [
      { message: "We have acknowledged your complaint. Admin will verify shortly.", isPublic: true, authorName: "Ravi (Ward 4)", authorRole: "WARD_MEMBER", createdAt: "2025-04-11T18:05:00" }
    ]
  },
  {
    id: "c2",
    complaintNumber: "CMP-2025-1037",
    type: "ELECTRICITY",
    description: "A streetlight near my house is not working for the past 3 days.",
    wardId: "WARD-02",
    wardName: "Ward 2 — Main Street",
    status: "IN_PROGRESS",
    priority: "NORMAL",
    citizenId: "u2",
    citizenName: "Latha Raj",
    citizenPhone: "+91 98765 43210",
    locationDescription: "Main Street, near bus stop",
    latitude: 13.0843,
    longitude: 80.2705,
    assignedToName: "Selvam (Electrician)",
    slaDeadline: "2025-04-18T10:00:00",
    isSlaBreached: false,
    resolutionNotes: "Electrician dispatched. Checking wiring.",
    citizenRating: null,
    citizenFeedback: null,
    resolvedAt: null,
    closedAt: null,
    createdAt: "2025-04-10T10:00:00",
    updatedAt: "2025-04-11T09:00:00",
    photos: [{ url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=140&fit=crop", stage: "BEFORE" }],
    statusHistory: [
      { status: "NEW", changedByName: "Latha Raj", changedByRole: "CITIZEN", remarks: "Complaint submitted", timestamp: "2025-04-10T10:00:00" },
      { status: "PENDING_REVIEW", changedByName: "Murugan (Ward 2)", changedByRole: "WARD_MEMBER", remarks: "Acknowledged", timestamp: "2025-04-10T11:00:00" },
      { status: "VERIFIED", changedByName: "Admin Ramesh", changedByRole: "ADMIN", remarks: "Verified. Priority: NORMAL.", timestamp: "2025-04-10T14:00:00" },
      { status: "ASSIGNED", changedByName: "Admin Ramesh", changedByRole: "ADMIN", remarks: "Assigned to Selvam", timestamp: "2025-04-10T15:00:00" },
      { status: "IN_PROGRESS", changedByName: "Murugan (Ward 2)", changedByRole: "WARD_MEMBER", remarks: "Work started", timestamp: "2025-04-11T09:00:00" }
    ],
    comments: []
  },
  {
    id: "c3",
    complaintNumber: "CMP-2025-1028",
    type: "ROAD",
    description: "Large pothole in the middle of Ward 2 main road has been filled.",
    wardId: "WARD-02",
    wardName: "Ward 2 — Main Road",
    status: "RESOLVED",
    priority: "NORMAL",
    citizenId: "u3",
    citizenName: "Raj Kumar",
    citizenPhone: "+91 91234 56789",
    locationDescription: "Main Road, Ward 2, near school gate",
    latitude: 13.0850,
    longitude: 80.2710,
    assignedToName: "Kannan (Road Crew)",
    slaDeadline: "2025-04-14T09:00:00",
    isSlaBreached: false,
    resolutionNotes: "Pothole filled with bitumen mix. Road surface restored to smooth condition.",
    citizenRating: null,
    citizenFeedback: null,
    resolvedAt: "2025-04-14T10:15:00",
    closedAt: null,
    createdAt: "2025-04-09T09:00:00",
    updatedAt: "2025-04-14T10:15:00",
    photos: [
      { url: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=200&h=140&fit=crop", stage: "BEFORE" },
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=140&fit=crop", stage: "AFTER" }
    ],
    statusHistory: [
      { status: "NEW", changedByName: "Raj Kumar", changedByRole: "CITIZEN", remarks: "Complaint submitted", timestamp: "2025-04-09T09:00:00" },
      { status: "PENDING_REVIEW", changedByName: "Murugan (Ward 2)", changedByRole: "WARD_MEMBER", remarks: "Acknowledged", timestamp: "2025-04-09T10:00:00" },
      { status: "VERIFIED", changedByName: "Admin Ramesh", changedByRole: "ADMIN", remarks: "Verified. Priority: NORMAL.", timestamp: "2025-04-09T12:00:00" },
      { status: "ASSIGNED", changedByName: "Admin Ramesh", changedByRole: "ADMIN", remarks: "Assigned to Kannan", timestamp: "2025-04-09T13:00:00" },
      { status: "IN_PROGRESS", changedByName: "Murugan (Ward 2)", changedByRole: "WARD_MEMBER", remarks: "Work started", timestamp: "2025-04-11T08:00:00" },
      { status: "RESOLVED", changedByName: "Murugan (Ward 2)", changedByRole: "WARD_MEMBER", remarks: "Pothole filled successfully.", timestamp: "2025-04-14T10:15:00" }
    ],
    comments: [
      { message: "Great work! Fixed quickly.", isPublic: true, authorName: "Raj Kumar", authorRole: "CITIZEN", createdAt: "2025-04-14T11:00:00" }
    ]
  },
  {
    id: "c4",
    complaintNumber: "CMP-2025-1038",
    type: "SANITATION",
    description: "Garbage is overflowing near the temple in Ward 8.",
    wardId: "WARD-08",
    wardName: "Ward 8 — Temple Street",
    status: "NEW",
    priority: "URGENT",
    citizenId: "u4",
    citizenName: "Priya Sundaram",
    citizenPhone: "+91 94567 89012",
    locationDescription: "Near Mariamman temple, main entrance",
    latitude: 13.0860,
    longitude: 80.2720,
    assignedToName: null,
    slaDeadline: "2025-04-12T18:00:00",
    isSlaBreached: true,
    resolutionNotes: null,
    citizenRating: null,
    citizenFeedback: null,
    resolvedAt: null,
    closedAt: null,
    createdAt: "2025-04-11T18:00:00",
    updatedAt: "2025-04-11T18:00:00",
    photos: [{ url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200&h=140&fit=crop", stage: "BEFORE" }],
    statusHistory: [
      { status: "NEW", changedByName: "Priya Sundaram", changedByRole: "CITIZEN", remarks: "Complaint submitted", timestamp: "2025-04-11T18:00:00" }
    ],
    comments: []
  },
  {
    id: "c5",
    complaintNumber: "CMP-2025-1024",
    type: "ELECTRICITY",
    description: "Broken streetlight at Main Street junction causing safety issues at night.",
    wardId: "WARD-02",
    wardName: "Ward 2 — Main Street",
    status: "IN_PROGRESS",
    priority: "URGENT",
    citizenId: "u5",
    citizenName: "Arun Selvam",
    citizenPhone: "+91 99887 76655",
    locationDescription: "Main Street junction, near post office",
    latitude: 13.0835,
    longitude: 80.2715,
    assignedToName: "Latha Raj (Electrician)",
    slaDeadline: "2025-04-18T00:00:00",
    isSlaBreached: false,
    resolutionNotes: "Replacement bulb ordered. Installation in progress.",
    citizenRating: null,
    citizenFeedback: null,
    resolvedAt: null,
    closedAt: null,
    createdAt: "2025-04-10T08:00:00",
    updatedAt: "2025-04-11T09:00:00",
    photos: [{ url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=140&fit=crop", stage: "BEFORE" }],
    statusHistory: [
      { status: "NEW", changedByName: "Arun Selvam", changedByRole: "CITIZEN", remarks: "Complaint submitted", timestamp: "2025-04-10T08:00:00" },
      { status: "PENDING_REVIEW", changedByName: "Murugan (Ward 2)", changedByRole: "WARD_MEMBER", remarks: "Acknowledged", timestamp: "2025-04-10T09:00:00" },
      { status: "VERIFIED", changedByName: "Admin Ramesh", changedByRole: "ADMIN", remarks: "Verified. Priority: URGENT.", timestamp: "2025-04-10T10:00:00" },
      { status: "ASSIGNED", changedByName: "Admin Ramesh", changedByRole: "ADMIN", remarks: "Assigned to Latha Raj", timestamp: "2025-04-10T11:00:00" },
      { status: "IN_PROGRESS", changedByName: "Murugan (Ward 2)", changedByRole: "WARD_MEMBER", remarks: "Work started", timestamp: "2025-04-11T09:00:00" }
    ],
    comments: []
  }
];

export const typeConfig = {
  WATER: { label: "Water", icon: "💧", color: "#2563eb", bg: "#dbeafe", tamil: "தண்ணீர்" },
  ELECTRICITY: { label: "Electricity", icon: "⚡", color: "#d97706", bg: "#fef3c7", tamil: "மின்சாரம்" },
  ROAD: { label: "Road", icon: "🛣️", color: "#6b7280", bg: "#f3f4f6", tamil: "சாலை" },
  PUBLIC_PROPERTY: { label: "Public Property", icon: "🏛️", color: "#7c3aed", bg: "#ede9fe", tamil: "பொது சொத்து" },
  SANITATION: { label: "Sanitation", icon: "🗑️", color: "#059669", bg: "#d1fae5", tamil: "சுகாதாரம்" },
  OTHER: { label: "Other", icon: "📋", color: "#6b7280", bg: "#f3f4f6", tamil: "மற்றவை" }
};

export const statusConfig = {
  NEW: { label: "New", color: "#6b7280", bg: "#f3f4f6", dot: "#6b7280" },
  PENDING_REVIEW: { label: "Pending", color: "#d97706", bg: "#fef3c7", dot: "#f59e0b" },
  VERIFIED: { label: "Verified", color: "#2563eb", bg: "#dbeafe", dot: "#3b82f6" },
  REJECTED: { label: "Rejected", color: "#dc2626", bg: "#fee2e2", dot: "#ef4444" },
  ASSIGNED: { label: "Assigned", color: "#7c3aed", bg: "#ede9fe", dot: "#8b5cf6" },
  IN_PROGRESS: { label: "In Progress", color: "#d97706", bg: "#fff7ed", dot: "#f97316" },
  RESOLVED: { label: "Resolved", color: "#059669", bg: "#d1fae5", dot: "#10b981" },
  CLOSED: { label: "Closed", color: "#065f46", bg: "#a7f3d0", dot: "#065f46" },
  ESCALATED: { label: "Escalated", color: "#dc2626", bg: "#fee2e2", dot: "#ef4444" }
};

export const priorityConfig = {
  URGENT: { label: "Urgent", color: "#dc2626", bg: "#fee2e2" },
  NORMAL: { label: "Normal", color: "#2563eb", bg: "#dbeafe" },
  LOW: { label: "Low", color: "#6b7280", bg: "#f3f4f6" }
};