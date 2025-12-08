package com.teamcodecoven.hrportal.payroll;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api")
public class PayrollController {

    // ------------------------------------------------------------------
    // In-memory payroll data for demo purposes (no DB calls, no RBAC).
    // UI is responsible for showing only what each role should see.
    // ------------------------------------------------------------------
    private static final List<PayrollRecord> PAYROLL_RECORDS = new ArrayList<>();
    private static final Map<Long, EmployeeMeta> EMPLOYEE_META = new HashMap<>();
    private static final AtomicLong ID_SEQUENCE = new AtomicLong(1);

    static {
        // --- Seed employee metadata (ids match your `users` table) ---
        // 1 = Employee User
        EMPLOYEE_META.put(1L, new EmployeeMeta(1L, "Employee User", "Engineering"));
        // 2 = Manager User
        EMPLOYEE_META.put(2L, new EmployeeMeta(2L, "Manager User", "Engineering"));
        // 3 = HR Admin User
        EMPLOYEE_META.put(3L, new EmployeeMeta(3L, "HR Admin User", "HR"));
        // 4 = Dev User
        EMPLOYEE_META.put(4L, new EmployeeMeta(4L, "Dev User", "Engineering"));
        // 5 = Analyst User
        EMPLOYEE_META.put(5L, new EmployeeMeta(5L, "Analyst User", "Analytics"));

        // -----------------------------
        // Employee User (id = 1)
        // -----------------------------
        addPayroll(1L, "2025-11", 8000, 500, 200);
        addPayroll(1L, "2025-10", 8000, 300, 150);
        addPayroll(1L, "2025-09", 8000, 300, 180);
        addPayroll(1L, "2025-08", 8000, 250, 170);

        // -----------------------------
        // Manager User (id = 2)
        // -----------------------------
        addPayroll(2L, "2025-11", 10000, 1000, 500);
        addPayroll(2L, "2025-10", 10000, 700, 400);
        addPayroll(2L, "2025-09", 10000, 800, 450);
        addPayroll(2L, "2025-08", 10000, 900, 500);

        // -----------------------------
        // HR Admin User (id = 3)
        // -----------------------------
        addPayroll(3L, "2025-11", 12000, 1500, 700);
        addPayroll(3L, "2025-10", 12000, 1200, 650);
        addPayroll(3L, "2025-09", 12000, 1200, 650);
        addPayroll(3L, "2025-08", 12000, 1000, 600);

        // -----------------------------
        // Dev User (id = 4)
        // -----------------------------
        addPayroll(4L, "2025-11", 9000, 400, 200);
        addPayroll(4L, "2025-10", 9000, 300, 180);

        // -----------------------------
        // Analyst User (id = 5)
        // -----------------------------
        addPayroll(5L, "2025-11", 7500, 300, 150);
        addPayroll(5L, "2025-10", 7500, 250, 160);
    }

    private static void addPayroll(Long employeeId,
                                   String month,
                                   double baseSalary,
                                   double bonus,
                                   double deductions) {
        // Keep the constructor shape you already use: (id, employeeId, month, base, bonus, deductions)
        PayrollRecord record = new PayrollRecord(
                ID_SEQUENCE.getAndIncrement(),
                employeeId,
                month,
                baseSalary,
                bonus,
                deductions
        );
        PAYROLL_RECORDS.add(record);
    }

    // -----------------------------------------------------------
    // 1) Employee-level payroll: /api/employees/{id}/payroll
    //    Used by "My Payroll" for logged-in user.
    //    ❗ No internal RBAC here – UI decides which id to call with.
    // -----------------------------------------------------------

    @GetMapping("/employees/{employeeId}/payroll")
    public List<PayrollRecord> getPayrollForEmployee(@PathVariable Long employeeId) {
        return PAYROLL_RECORDS.stream()
                .filter(r -> r.getEmployeeId().equals(employeeId))
                // latest month first
                .sorted(Comparator.comparing(PayrollRecord::getMonth).reversed())
                .collect(Collectors.toList());
    }

    @PostMapping("/employees/{employeeId}/payroll")
    public PayrollRecord createPayrollForEmployee(
            @PathVariable Long employeeId,
            @RequestBody PayrollRecord payload
    ) {
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
    //    Used by:
    //    - Manager "Team Payroll"
    //    - HR "Admin Dashboard"
    //
    //    Again, NO RBAC here – UI decides who can see this page.
    // -----------------------------------------------------------

    public static class GlobalPayrollRow {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private String department;
        private String month;
        private double netPay;

        public GlobalPayrollRow() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getEmployeeId() { return employeeId; }
        public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

        public String getEmployeeName() { return employeeName; }
        public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }

        public double getNetPay() { return netPay; }
        public void setNetPay(double netPay) { this.netPay = netPay; }
    }

    private record EmployeeMeta(Long id, String name, String department) { }

    @GetMapping("/payroll")
    public ResponseEntity<List<GlobalPayrollRow>> getGlobalPayroll(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String department
    ) {
        Stream<PayrollRecord> stream = PAYROLL_RECORDS.stream();

        // Optional filters
        if (month != null && !month.isBlank()) {
            stream = stream.filter(r -> month.equals(r.getMonth()));
        }

        if (department != null
                && !department.isBlank()
                && !"All".equalsIgnoreCase(department)) {
            stream = stream.filter(r -> {
                EmployeeMeta meta = EMPLOYEE_META.get(r.getEmployeeId());
                return meta != null &&
                        department.equalsIgnoreCase(meta.department());
            });
        }

        List<GlobalPayrollRow> rows = stream
                .map(r -> {
                    EmployeeMeta meta = EMPLOYEE_META.get(r.getEmployeeId());
                    GlobalPayrollRow row = new GlobalPayrollRow();
                    row.setId(r.getId());
                    row.setEmployeeId(r.getEmployeeId());
                    row.setMonth(r.getMonth());
                    row.setNetPay(r.getNetPay()); // or computed inside PayrollRecord
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