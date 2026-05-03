import { getToken } from "./api";

const BASE = "http://localhost:8081/api/v1/blockchain";

async function handleResponse(res) {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json; // Return the whole response object for success check
}

function authHeaders() {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export const blockchainApi = {
  submitRequest: (payload) => {
    return fetch(`${BASE}/funds/request`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  },

  getPendingRequests: () => {
    return fetch(`${BASE}/funds/pending`, {
      headers: authHeaders(),
    }).then(handleResponse);
  },

  castVote: (fundId, payload) => {
    return fetch(`${BASE}/funds/${fundId}/vote`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  },

  getApprovedFunds: () => {
    return fetch(`${BASE}/funds/approved`, {
      headers: authHeaders(),
    }).then(handleResponse);
  },

  createWorkOrder: (fundId, payload) => {
    return fetch(`${BASE}/funds/${fundId}/work-order`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  },

  completeWorkOrder: (workOrderId, payload) => {
    return fetch(`${BASE}/work-orders/${workOrderId}/complete`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse);
  },

  getFundHistory: (fundId) => {
    return fetch(`${BASE}/funds/${fundId}/history`, {
      headers: authHeaders(),
    }).then(handleResponse);
  }
};
