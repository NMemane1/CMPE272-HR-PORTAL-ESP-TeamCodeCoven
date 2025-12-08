package com.teamcodecoven.hrportal.payroll;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api")
public class PayrollController {

    // In-memory payroll data for demo purposes
    private static final List<PayrollRecord> PAYROLL_RECORDS = new ArrayList<>();
    private static final Map<Long, EmployeeMeta> EMPLOYEE_META = new HashMap<>();
    private static final AtomicLong ID_SEQUENCE = new AtomicLong(100);

   static {
    // --- Seed employee meta used for names / departments / roles ---
    // These three map to real login users:
    // 1 -> employee@test.com (EMPLOYEE)
    // 2 -> manager@test.com  (MANAGER)
    // 3 -> hradmin@test.com  (HR_ADMIN)
    EMPLOYEE_META.put(1L, new EmployeeMeta(1L, "employee@test.com", "Erin Employee", "Development", "EMPLOYEE"));
    EMPLOYEE_META.put(2L, new EmployeeMeta(2L, "manager@test.com", "Manny Manager", "Development", "MANAGER"));
    EMPLOYEE_META.put(3L, new EmployeeMeta(3L, "hradmin@test.com", "Alex Admin", "HR", "HR_ADMIN"));

    // Extra demo-only employees (no separate logins, just to make UI richer)
    EMPLOYEE_META.put(4L, new EmployeeMeta(4L, "dev1@company.com", "Dana Developer", "Development", "EMPLOYEE"));
    EMPLOYEE_META.put(5L, new EmployeeMeta(5L, "analyst@company.com", "Chris Analyst", "Analytics", "EMPLOYEE"));

    // --- Seed payroll records (months must match frontend e.g. "2025-12") ---

    // Employee (id = 1)
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 1L, "2025-12", 8000, 500, 200));
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 1L, "2025-11", 8000, 300, 150));
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 1L, "2025-10", 8000, 250, 150));

    // Manager (id = 2)
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 2L, "2025-12", 10000, 800, 300));
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 2L, "2025-11", 10000, 700, 400));
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 2L, "2025-10", 10000, 600, 350));

    // HR Admin (id = 3)
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 3L, "2025-12", 12000, 1500, 700));
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 3L, "2025-11", 12000, 1300, 650));
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 3L, "2025-10", 12000, 1200, 650));

    // Dana Developer (id = 4) – part of manager’s team
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 4L, "2025-12", 7500, 400, 180));
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 4L, "2025-11", 7500, 350, 170));

    // Chris Analyst (id = 5) – another team member
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 5L, "2025-12", 7800, 420, 200));
    PAYROLL_RECORDS.add(new PayrollRecord(ID_SEQUENCE.getAndIncrement(), 5L, "2025-11", 7800, 380, 190));
}

    // -----------------------------------------------------------
    // Helpers: current user + roles
    // -----------------------------------------------------------

    private EmployeeMeta requireCurrentEmployeeMeta() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        String email = auth.getName(); // Spring Security username (email)
        return EMPLOYEE_META.values().stream()
                .filter(m -> m.email().equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "No payroll mapping found for the current user."
                ));
    }

    private boolean hasRole(EmployeeMeta meta, String role) {
        return role.equalsIgnoreCase(meta.role());
    }

    private List<PayrollRecord> findPayrollForEmployee(Long employeeId) {
        return PAYROLL_RECORDS.stream()
                .filter(r -> r.getEmployeeId().equals(employeeId))
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------
    // 1) "My Payroll" – uses logged-in user, safest for frontend
    //    GET /api/employees/me/payroll
    // -----------------------------------------------------------

    @GetMapping("/employees/me/payroll")
    public List<PayrollRecord> getMyPayroll() {
        EmployeeMeta current = requireCurrentEmployeeMeta();
        return findPayrollForEmployee(current.id());
    }

    // -----------------------------------------------------------
    // 1b) Employee-level payroll: /api/employees/{id}/payroll
    //     (kept for compatibility, but with access checks)
    // -----------------------------------------------------------

    @GetMapping("/employees/{employeeId}/payroll")
    public List<PayrollRecord> getPayrollForEmployee(@PathVariable Long employeeId) {
        EmployeeMeta current = requireCurrentEmployeeMeta();
        EmployeeMeta target = EMPLOYEE_META.get(employeeId);

        if (target == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found.");
        }

        // EMPLOYEE: can only see their own payroll
        if (hasRole(current, "EMPLOYEE") && !current.id().equals(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to view this employee's payroll."
            );
        }

        // MANAGER: cannot see HR payroll at all
        if (hasRole(current, "MANAGER") && hasRole(target, "HR_ADMIN")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to view this employee's payroll."
            );
        }

        // HR_ADMIN: cannot see other HR admins (only self)
        if (hasRole(current, "HR_ADMIN")
                && hasRole(target, "HR_ADMIN")
                && !current.id().equals(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to view this employee's payroll."
            );
        }

        // Otherwise allowed
        return findPayrollForEmployee(employeeId);
    }

    @PostMapping("/employees/{employeeId}/payroll")
    public PayrollRecord createPayrollForEmployee(
            @PathVariable Long employeeId,
            @RequestBody PayrollRecord payload
    ) {
        // For the demo we allow this only for HR; you can adjust if needed.
        EmployeeMeta current = requireCurrentEmployeeMeta();

        if (!hasRole(current, "HR_ADMIN")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to modify payroll records."
            );
        }

        long newId = ID_SEQUENCE.getAndIncrement();
        PayrollRecord record = new PayrollRecord(
                newId,
                employeeId,
                payload.getMonth(),
                payload.getBaseSalary(),
                payload.getBonus(),
                payload.getDeductions()
        );
        PAYROLL_RECORDS.add(record);
        return record;
    }

    // -----------------------------------------------------------
    // 2) Global payroll: /api/payroll?month=YYYY-MM[&department=...]
    //    (Manager "Team Payroll" and HR "Admin Dashboard")
    // -----------------------------------------------------------

    public static class GlobalPayrollRow {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private String department;
        private String month;
        private double netPay;

        public GlobalPayrollRow() {
        }

        // getters / setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(Long employeeId) {
            this.employeeId = employeeId;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public void setEmployeeName(String employeeName) {
            this.employeeName = employeeName;
        }

        public String getDepartment() {
            return department;
        }

        public void setDepartment(String department) {
            this.department = department;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public double getNetPay() {
            return netPay;
        }

        public void setNetPay(double netPay) {
            this.netPay = netPay;
        }
    }

    private record EmployeeMeta(Long id, String email, String name, String department, String role) {
    }

    @GetMapping("/payroll")
    public ResponseEntity<List<GlobalPayrollRow>> getGlobalPayroll(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String department
    ) {
        EmployeeMeta current = requireCurrentEmployeeMeta();
        Stream<PayrollRecord> stream = PAYROLL_RECORDS.stream();

        // Filter by month if provided
        if (month != null && !month.isBlank()) {
            stream = stream.filter(r -> month.equals(r.getMonth()));
        }

        // Filter by department if provided (and not "All")
        if (department != null
                && !department.isBlank()
                && !"All".equalsIgnoreCase(department)) {
            stream = stream.filter(r -> {
                EmployeeMeta meta = EMPLOYEE_META.get(r.getEmployeeId());
                return meta != null
                        && department.equalsIgnoreCase(meta.department());
            });
        }

        // ---- Role-based visibility rules ----
        if (hasRole(current, "EMPLOYEE")) {
            // Employees: only their own records
            stream = stream.filter(r -> r.getEmployeeId().equals(current.id()));

        } else if (hasRole(current, "MANAGER")) {
            // Managers: can view non-HR only
            stream = stream.filter(r -> {
                EmployeeMeta meta = EMPLOYEE_META.get(r.getEmployeeId());
                return meta != null && !hasRole(meta, "HR_ADMIN");
            });

        } else if (hasRole(current, "HR_ADMIN")) {
            // HR: can see self + all non-HR employees, but not other HR admins
            stream = stream.filter(r -> {
                EmployeeMeta meta = EMPLOYEE_META.get(r.getEmployeeId());
                if (meta == null) return false;

                // Always allow self
                if (meta.id().equals(current.id())) {
                    return true;
                }

                // Block other HR admins
                return !hasRole(meta, "HR_ADMIN");
            });

        } else {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to view payroll data."
            );
        }

        List<GlobalPayrollRow> rows = stream
                .map(r -> {
                    EmployeeMeta meta = EMPLOYEE_META.get(r.getEmployeeId());
                    GlobalPayrollRow row = new GlobalPayrollRow();
                    row.setId(r.getId());
                    row.setEmployeeId(r.getEmployeeId());
                    row.setMonth(r.getMonth());
                    row.setNetPay(r.getNetPay());
                    if (meta != null) {
                        row.setEmployeeName(meta.name());
                        row.setDepartment(meta.department());
                    } else {
                        row.setEmployeeName("Unknown");
                        row.setDepartment("Unknown");
                    }
                    return row;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(rows);
    }
}