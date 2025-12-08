// ---- REAL BACKEND MODE ONLY ----

const API_BASE_URL = "http://ec2-54-176-21-21.us-west-1.compute.amazonaws.com:8080";
console.log("API_BASE_URL:", API_BASE_URL);

// Helper to get auth headers with role
function authHeaders() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return {
    Authorization: token ? `Bearer ${token}` : "",
    "X-User-Role": role || "EMPLOYEE",
  };
}

// ------------------------
// Low-level HTTP helpers
// ------------------------
async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),             // <-- NEW (adds token + role)
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      data?.message || `Request to ${path} failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  return data;
}

function apiGet(path) {
  return apiRequest(path, { method: "GET" });
}
function apiPost(path, body) {
  return apiRequest(path, { method: "POST", body: JSON.stringify(body) });
}
function apiPut(path, body) {
  return apiRequest(path, { method: "PUT", body: JSON.stringify(body) });
}
function apiDelete(path) {
  return apiRequest(path, { method: "DELETE" });
}

// ------------------------
// Auth APIs
// ------------------------
export function login(email, password) {
  return apiPost("/api/auth/login", { email, password });
}

export function getCurrentUser() {
  return apiGet("/api/auth/me");
}

// ------------------------
// Employee APIs
// ------------------------
export function getEmployees() {
  return apiGet("/api/employees");
}

export function getEmployeeById(id) {
  return apiGet(`/api/employees/${id}`);
}

export function createEmployee(payload) {
  return apiPost("/api/employees", payload);
}

export function updateEmployee(id, payload) {
  return apiPut(`/api/employees/${id}`, payload);
}

export function deactivateEmployee(id) {
  return apiDelete(`/api/employees/${id}`);
}

// ------------------------
// Payroll APIs
// ------------------------
export function getPayrollForEmployee(employeeId) {
  return apiGet(`/api/employees/${employeeId}/payroll`);
}

export function createPayrollRecordForEmployee(employeeId, payload) {
  return apiPost(`/api/employees/${employeeId}/payroll`, payload);
}

export function getGlobalPayroll(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiGet(`/api/payroll?${qs}`);
}

// ------------------------
// Performance APIs
// ------------------------
export function getPerformanceReviews(employeeId) {
  return apiGet(`/api/employees/${employeeId}/performance`);
}

export function createPerformanceReview(employeeId, payload) {
  return apiPost(`/api/employees/${employeeId}/performance`, payload);
}

export function updatePerformanceReview(employeeId, reviewId, payload) {
  return apiPut(`/api/employees/${employeeId}/performance/${reviewId}`, payload);
}