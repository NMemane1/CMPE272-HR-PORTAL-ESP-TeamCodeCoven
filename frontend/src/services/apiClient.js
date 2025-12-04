// Toggle this with .env: VITE_USE_MOCK=true/false
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "false";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://ec2-54-176-21-21.us-west-1.compute.amazonaws.com:8080";

// ---------- MOCK DATA ---------- //
const MOCK_USERS_BY_EMAIL = {
  "employee@company.com": {
    userId: 1,
    name: "Erin Employee",
    email: "employee@company.com",
    role: "EMPLOYEE",
    token: "mock-token-employee",
  },
  "manager@company.com": {
    userId: 2,
    name: "Manny Manager",
    email: "manager@company.com",
    role: "MANAGER",
    token: "mock-token-manager",
  },
  "admin@company.com": {
    userId: 3,
    name: "Alex Admin",
    email: "admin@company.com",
    role: "HR_ADMIN",
    token: "mock-token-admin",
  },
};

// mock employee list
const mockEmployees = [
  {
    id: 1,
    name: "Erin Employee",
    email: "employee@company.com",
    department: "Development",
    title: "Software Engineer",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Manny Manager",
    email: "manager@company.com",
    department: "Development",
    title: "Engineering Manager",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Alex Admin",
    email: "admin@company.com",
    department: "HR",
    title: "HR Admin",
    status: "ACTIVE",
  },
];

// payroll history per employee 
const mockPayrollByEmployeeId = {
  1: [
    {
      id: 10,
      employeeId: 1,
      month: "2025-11",
      baseSalary: 8000,
      bonus: 500,
      deductions: 200,
      netPay: 8300,
    },
    {
      id: 11,
      employeeId: 1,
      month: "2024-09",
      baseSalary: 8000,
      bonus: 300,
      deductions: 100,
      netPay: 8200,
    },
  ],
  2: [
    {
      id: 20,
      employeeId: 2,
      month: "2025-11",
      baseSalary: 10000,
      bonus: 800,
      deductions: 300,
      netPay: 10500,
    },
  ],
};

// performance reviews per employee 
const mockPerformanceByEmployeeId = {
  1: [
    {
      id: 5,
      employeeId: 1,
      reviewerId: 2,
      period: "2024-H1",
      rating: 4.5,
      comments: "Great team player",
    },
    {
      id: 6,
      employeeId: 1,
      reviewerId: 2,
      period: "2023-H2",
      rating: 4.2,
      comments: "Consistent performance",
    },
  ],
};

// LOW-LEVEL HELPERS 

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

// AUTH APIs 

export async function login(email, password) {
  if (USE_MOCK) {
    const user = MOCK_USERS_BY_EMAIL[email];
    if (!user) {
      throw new Error("Invalid mock email. Try employee@company.com, manager@company.com, or admin@company.com");
    }
    return user; 
  }
  return apiPost("/api/auth/login", { email, password });
}

export async function getCurrentUser() {
  if (USE_MOCK) {
    // In mock mode, AuthProvider already knows the user;
    // this is only for real backend mode.
    throw new Error("getCurrentUser not used in mock mode");
  }
  return apiGet("/api/auth/me");
}

//  EMPLOYEE APIs 

export async function getEmployees() {
  if (USE_MOCK) {
    return mockEmployees;
  }
  return apiGet("/api/employees");
}

export async function getEmployeeById(id) {
  if (USE_MOCK) {
    const emp = mockEmployees.find((e) => e.id === Number(id));
    if (!emp) throw new Error(`Employee with id=${id} not found (mock)`);
    return emp;
  }
  return apiGet(`/api/employees/${id}`);
}

export async function createEmployee(payload) {
  if (USE_MOCK) {
    const newEmp = {
      id: mockEmployees.length + 1,
      status: "ACTIVE",
      ...payload,
    };
    mockEmployees.push(newEmp);
    return newEmp;
  }
  return apiPost("/api/employees", payload);
}

export async function updateEmployee(id, payload) {
  if (USE_MOCK) {
    const idx = mockEmployees.findIndex((e) => e.id === Number(id));
    if (idx === -1) throw new Error(`Employee with id=${id} not found (mock)`);
    mockEmployees[idx] = { ...mockEmployees[idx], ...payload };
    return mockEmployees[idx];
  }
  return apiPut(`/api/employees/${id}`, payload);
}

export async function deactivateEmployee(id) {
  if (USE_MOCK) {
    const idx = mockEmployees.findIndex((e) => e.id === Number(id));
    if (idx === -1) throw new Error(`Employee with id=${id} not found (mock)`);
    mockEmployees[idx].status = "INACTIVE";
    return { message: "Employee deactivated", id: Number(id) };
  }
  return apiDelete(`/api/employees/${id}`);
}

// PAYROLL APIs 

export async function getPayrollForEmployee(employeeId) {
  if (USE_MOCK) {
    return mockPayrollByEmployeeId[employeeId] || [];
  }
  return apiGet(`/api/employees/${employeeId}/payroll`);
}

export async function createPayrollRecordForEmployee(employeeId, payload) {
  if (USE_MOCK) {
    const list = mockPayrollByEmployeeId[employeeId] || [];
    const newRecord = {
      id: Date.now(),
      employeeId,
      netPay:
        payload.baseSalary + (payload.bonus || 0) - (payload.deductions || 0),
      ...payload,
    };
    list.push(newRecord);
    mockPayrollByEmployeeId[employeeId] = list;
    return newRecord;
  }
  return apiPost(`/api/employees/${employeeId}/payroll`, payload);
}

export async function getGlobalPayroll({ month, department }) {
  if (USE_MOCK) {
    // simple mock: flatten all payroll and filter
    let all = Object.values(mockPayrollByEmployeeId).flat();
    if (month) {
      all = all.filter((r) => r.month === month);
    }
    // For department, we’d need employee -> dept mapping;
    return all.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName:
        mockEmployees.find((e) => e.id === r.employeeId)?.name || "Unknown",
      department: "Development",
      month: r.month,
      netPay: r.netPay,
    }));
  }

  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (department) params.append("department", department);

  return apiGet(`/api/payroll?${params.toString()}`);
}

// PERFORMANCE APIs 

export async function getPerformanceReviews(employeeId) {
  if (USE_MOCK) {
    return mockPerformanceByEmployeeId[employeeId] || [];
  }
  return apiGet(`/api/employees/${employeeId}/performance`);
}

export async function createPerformanceReview(employeeId, payload) {
  if (USE_MOCK) {
    const list = mockPerformanceByEmployeeId[employeeId] || [];
    const newReview = {
      id: Date.now(),
      employeeId,
      ...payload,
    };
    list.push(newReview);
    mockPerformanceByEmployeeId[employeeId] = list;
    return newReview;
  }
  return apiPost(`/api/employees/${employeeId}/performance`, payload);
}

export async function updatePerformanceReview(
  employeeId,
  reviewId,
  payload
) {
  if (USE_MOCK) {
    const list = mockPerformanceByEmployeeId[employeeId] || [];
    const idx = list.findIndex((r) => r.id === Number(reviewId));
    if (idx === -1)
      throw new Error(`Review with id=${reviewId} not found (mock)`);
    list[idx] = { ...list[idx], ...payload };
    return list[idx];
  }
  return apiPut(`/api/employees/${employeeId}/performance/${reviewId}`, payload);
}
