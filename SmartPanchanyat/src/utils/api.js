/**
 * API service layer — SmartPanchayat ↔ Spring Boot backend.
 * Base URL: http://localhost:8081
 *
 * Public routes need no JWT.
 * Admin/Ward routes require: Authorization: Bearer <token>
 */

const BASE = "http://localhost:8081/api/v1";
const PUBLIC = `${BASE}/complaints/public`;
const AUTH = `${BASE}/auth`;

// ── Token management ───────────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem("sp_token");
}
export function getUser() {
  return JSON.parse(localStorage.getItem("sp_user") || "null");
}
export function isLoggedIn() {
  return !!getToken();
}
export function getRole() {
  return getUser()?.role || null;
}
export function getWardId() {
  return getUser()?.wardId || null;
}

export function saveAuth(data) {
  localStorage.setItem("sp_token", data.token);
  localStorage.setItem(
    "sp_user",
    JSON.stringify({
      userId: data.userId,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
      wardId: data.wardId,
      wardName: data.wardName,
      walletAddress: data.walletAddress || null,
      walletStatus: data.walletStatus || "PENDING",
    }),
  );
}

/**
 * Update the locally cached user with a new wallet address.
 */
export function updateLocalWallet(walletAddress) {
  const user = getUser();
  if (user) {
    user.walletAddress = walletAddress;
    user.walletStatus = "ACTIVE";
    localStorage.setItem("sp_user", JSON.stringify(user));
  }
}

export function logout() {
  localStorage.removeItem("sp_token");
  localStorage.removeItem("sp_user");
}

/**
 * Save wallet address for a logged-in user (no setup-token needed).
 */
export function connectWallet(userId, walletAddress) {
  return post(
    `${BASE}/blockchain/identity/connect-wallet`,
    { userId, walletAddress },
    true,
  );
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function handleResponse(res) {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  // Backend wraps everything in { success, data, message }
  return json?.data ?? json;
}

function authHeaders() {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

function get(url, auth = false) {
  return fetch(url, {
    headers: auth ? authHeaders() : {},
  }).then(handleResponse);
}

function post(url, body, auth = false) {
  return fetch(url, {
    method: "POST",
    headers: auth ? authHeaders() : { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(handleResponse);
}

function put(url, body, auth = true) {
  return fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then(handleResponse);
}

// ── Auth API ──────────────────────────────────────────────────────────────────

/**
 * Login — works for ADMIN and WARD_MEMBER.
 * Saves token and user profile to localStorage.
 */
export async function login(username, password) {
  const data = await post(`${AUTH}/login`, { username, password });
  saveAuth(data);
  return data;
}

/**
 * Register a new ADMIN or WARD_MEMBER (requires existing ADMIN token).
 */
export function registerUser(payload) {
  return post(`${AUTH}/register`, payload, true);
}

/**
 * List all staff members (Admin only).
 */
export function getStaffList() {
  return get(`${AUTH}/staff`, true);
}

export function resetWallet(userId) {
  return post(`${AUTH}/reset-wallet/${userId}`, {}, true);
}

// ── Public API (no auth) ───────────────────────────────────────────────────────

/**
 * Paginated list of all complaints.
 */
export function listComplaints(page = 0, size = 20) {
  return get(`${PUBLIC}/list?page=${page}&size=${size}`);
}

/**
 * Track a complaint by its number (e.g. CMP-2025-1045).
 */
export function trackComplaint(complaintNumber) {
  return get(`${PUBLIC}/track/${encodeURIComponent(complaintNumber)}`);
}

/**
 * Submit a new complaint (no auth required).
 */
export function submitComplaint(payload) {
  return post(`${PUBLIC}/submit`, payload);
}

/**
 * Upload photos for a complaint (public).
 */
export function uploadComplaintPhotos(complaintId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return fetch(`${PUBLIC}/${complaintId}/photos`, {
    method: "POST",
    body: formData,
  }).then(handleResponse);
}

/**
 * Add a public comment to a complaint (citizen).
 */
export function addComment(complaintId, message) {
  return post(`${PUBLIC}/${complaintId}/comment`, { message, isPublic: true });
}

/**
 * Ward public stats.
 */
export function getWardStats(wardId) {
  return get(`${PUBLIC}/stats/${wardId}`);
}

// ── Admin API (ADMIN token required) ──────────────────────────────────────────

export function adminListComplaints(params = {}) {
  const q = new URLSearchParams(params).toString();
  return get(`${BASE}/complaints/admin?${q}`, true);
}

export function adminGetById(id) {
  return get(`${BASE}/complaints/admin/${id}`, true);
}

export function adminVerify(id, payload) {
  return put(`${BASE}/complaints/admin/${id}/verify`, payload);
}

export function adminAssign(id, payload) {
  return put(`${BASE}/complaints/admin/${id}/assign`, payload);
}

export function adminEscalate(id, reason) {
  return put(
    `${BASE}/complaints/admin/${id}/escalate?reason=${encodeURIComponent(reason)}`,
    undefined,
  );
}

export function adminComment(id, message, isPublic = false) {
  return post(
    `${BASE}/complaints/admin/${id}/comment`,
    { message, isPublic },
    true,
  );
}

export function adminAnalytics(wardId, fromDate, toDate) {
  const params = new URLSearchParams();
  if (wardId) params.set("wardId", wardId);
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  return get(`${BASE}/complaints/admin/analytics?${params}`, true);
}

// ── Ward Member API (WARD_MEMBER token required) ───────────────────────────────

export function wardListComplaints(wardId, status, page = 0, size = 20) {
  const params = new URLSearchParams({ page, size });
  if (status) params.set("status", status);
  return get(`${BASE}/complaints/ward/${wardId}?${params}`, true);
}

export function wardGetById(id) {
  return get(`${BASE}/complaints/ward/detail/${id}`, true);
}

export function wardAcknowledge(id) {
  return put(`${BASE}/complaints/ward/${id}/acknowledge`, undefined);
}

export function wardVerify(id, data) {
  return put(`${BASE}/complaints/ward/${id}/verify`, data);
}

export function wardUpdateProgress(id, status, resolutionNotes, remarks) {
  return put(`${BASE}/complaints/ward/${id}/progress`, {
    status,
    resolutionNotes,
    remarks,
  });
}

export function wardComment(id, message, isPublic = true) {
  return post(
    `${BASE}/complaints/ward/${id}/comment`,
    { message, isPublic },
    true,
  );
}

// ── Notifications API ─────────────────────────────────────────────────────────

export function getNotifications(userId) {
  return get(`${BASE}/notifications/${userId}`, true);
}

// ── Data adapters ──────────────────────────────────────────────────────────────

/**
 * Normalise a backend ComplaintResponse into the frontend complaint shape.
 * Works for both citizen (public) and admin/ward (full) responses.
 */
export function mapComplaint(c) {
  if (!c) return null;
  return {
    id: c.id,
    complaintNumber: c.complaintNumber,
    type: c.type,
    description: c.description,
    wardId: c.wardId,
    wardName: c.wardName || c.wardId,
    status: c.status,
    priority: c.priority || "NORMAL",
    citizenId: c.citizenId,
    citizenName: c.citizenName || "Anonymous",
    citizenPhone: c.citizenPhone || null, // only present in full response
    locationDescription: c.locationDescription || "",
    latitude: c.latitude,
    longitude: c.longitude,
    assignedToId: c.assignedToId || null, // only in full response
    assignedToName: c.assignedToName || null,
    rejectionReason: c.rejectionReason || null, // only in full response
    slaDeadline: c.slaDeadline,
    isSlaBreached: c.isSlaBreached ?? false,
    resolutionNotes: c.resolutionNotes || null,
    citizenRating: c.citizenRating || null,
    citizenFeedback: c.citizenFeedback || null,
    resolvedAt: c.resolvedAt || null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    photos: (c.photos || []).map((p) => {
      let url = p.url;
      // If it's a local path (e.g. starting with /api/v1), prefix it with our base origin
      if (url && url.startsWith("/api/v1")) {
        url = "http://localhost:8081" + url;
      }
      return {
        url: url,
        stage: p.photoStage || p.stage || "BEFORE",
      };
    }),
    statusHistory: (c.statusHistory || []).map((h) => ({
      status: h.newStatus || h.status,
      changedByName: h.changedByName,
      changedByRole: h.changedByRole,
      remarks: h.remarks || "",
      timestamp: h.changedAt || h.timestamp,
    })),
    comments: (c.comments || []).map((cm) => ({
      id: cm.id,
      message: cm.message,
      isPublic: cm.isPublic ?? true,
      authorName: cm.authorName,
      authorRole: cm.authorRole,
      createdAt: cm.createdAt,
    })),
  };
}
