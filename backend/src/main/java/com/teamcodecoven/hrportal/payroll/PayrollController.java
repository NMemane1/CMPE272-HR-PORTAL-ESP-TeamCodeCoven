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

    // ------------------------------------------------------------
    // UI RBAC
    // ------------------------------------------------------------
    private static final List<PayrollRecord> PAYROLL_RECORDS = new ArrayList<>();
    private static final Map<Long, EmployeeMeta> EMPLOYEE_META = new HashMap<>();
    private static final AtomicLong ID_SEQUENCE = new AtomicLong(1);

    static {
        // ------------------------------------------------------------
        // Employee metadata (ids match your users table)
        // ------------------------------------------------------------
        EMPLOYEE_META.put(1L, new EmployeeMeta(1L, "Employee User", "Development"));
        EMPLOYEE_META.put(2L, new EmployeeMeta(2L, "Manager User", "Development"));
        EMPLOYEE_META.put(3L, new EmployeeMeta(3L, "HR Admin User", "HR"));
        

        // ============================================================
        // 1) Employee User (ID = 1) — SWE
        // ============================================================
        addPayroll(1L, "2025-11", 8200, 500, 210);  // net: 8490
        addPayroll(1L, "2025-10", 8200, 420, 200);  // net: 8420
        addPayroll(1L, "2025-09", 8200, 380, 190);  // net: 8390
        addPayroll(1L, "2025-08", 8200, 350, 185);  // net: 8365

        // ============================================================
        // 2) Manager User (ID = 2) — Engineering Manager
        // ============================================================
        addPayroll(2L, "2025-11", 11500, 1300, 600);  // net: 12200
        addPayroll(2L, "2025-10", 11500, 1200, 580);  // net: 12120
        addPayroll(2L, "2025-09", 11500, 1100, 560);  // net: 12040
        addPayroll(2L, "2025-08", 11500, 1000, 540);  // net: 11960

        // ============================================================
        // 3) HR Admin (ID = 3) — Sr. HR Business Partner (HIGHEST)
        // ============================================================
        addPayroll(3L, "2025-11", 12500, 1600, 720);  // net: 13380
        addPayroll(3L, "2025-10", 12500, 1500, 700);  // net: 13300
        addPayroll(3L, "2025-09", 12500, 1400, 680);  // net: 13220
        addPayroll(3L, "2025-08", 12500, 1300, 650);  // net: 13150

    }

    private static void addPayroll(Long employeeId,
                                   String month,
                                   double baseSalary,
                                   double bonus,
                                   double deductions) {

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

    // ------------------------------------------------------------
    // 1) Employee-level payroll: /api/employees/{id}/payroll
    //    Used by “My Payroll” / Employee dashboard.
    // ------------------------------------------------------------
    @GetMapping("/employees/{employeeId}/payroll")
    public List<PayrollRecord> getPayrollForEmployee(@PathVariable Long employeeId) {
        return PAYROLL_RECORDS.stream()
                .filter(r -> r.getEmployeeId().equals(employeeId))
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

    // ------------------------------------------------------------
    // 2) Global payroll: /api/payroll?month=YYYY-MM[&department=...]
    //    Used by Manager / HR dashboards.
    // ------------------------------------------------------------
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

    private record EmployeeMeta(Long id, String name, String department) {}

    @GetMapping("/payroll")
    public ResponseEntity<List<GlobalPayrollRow>> getGlobalPayroll(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String department
    ) {
        Stream<PayrollRecord> stream = PAYROLL_RECORDS.stream();

        if (month != null && !month.isBlank()) {
            stream = stream.filter(r -> month.equals(r.getMonth()));
        }

        if (department != null && !department.isBlank()
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