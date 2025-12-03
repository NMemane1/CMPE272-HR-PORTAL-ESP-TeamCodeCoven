export const ROLES = {
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
  HR_ADMIN: "HR_ADMIN",
};

export function isEmployee(user) {
  return user?.role === ROLES.EMPLOYEE;
}

export function isManager(user) {
  return user?.role === ROLES.MANAGER;
}

export function isHrAdmin(user) {
  return user?.role === ROLES.HR_ADMIN;
}

// --- EMPLOYEES APIs --- //

export function canViewEmployeesList(user) {
  return isManager(user) || isHrAdmin(user);
}

export function canViewEmployee(user, employeeId) {
  if (!user) return false;
  if (isHrAdmin(user) || isManager(user)) return true;
  return isEmployee(user) && user.userId === Number(employeeId);
}

export function canCreateEmployee(user) {
  return isHrAdmin(user);
}

export function canUpdateEmployee(user, employeeId) {
  if (!user) return false;
  if (isHrAdmin(user) || isManager(user)) return true;
  return isEmployee(user) && user.userId === Number(employeeId);
}

export function canDeleteEmployee(user) {
  return isHrAdmin(user);
}

// --- PAYROLL APIs --- //

export function canViewEmployeePayroll(user, employeeId) {
  if (!user) return false;
  if (isHrAdmin(user) || isManager(user)) return true;
  return isEmployee(user) && user.userId === Number(employeeId);
}

export function canCreatePayrollRecord(user) {
  return isHrAdmin(user);
}

export function canViewGlobalPayroll(user) {
  return isHrAdmin(user) || isManager(user);
}

// --- PERFORMANCE APIs --- //

export function canViewPerformance(user, employeeId) {
  if (!user) return false;
  if (isHrAdmin(user) || isManager(user)) return true;
  return isEmployee(user) && user.userId === Number(employeeId);
}

export function canCreatePerformanceReview(user) {
  return isManager(user) || isHrAdmin(user);
}

export function canUpdatePerformanceReview(user) {
  return isManager(user) || isHrAdmin(user);
}
