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

    // In-memory payroll data for demo purposes
    private static final List<PayrollRecord> PAYROLL_RECORDS = new ArrayList<>();
    private static final Map<Long, EmployeeMeta> EMPLOYEE_META = new HashMap<>();
    private static final AtomicLong ID_SEQUENCE = new AtomicLong(100);

    static {
        // --- Seed employee meta used for names / departments ---
        EMPLOYEE_META.put(1L, new EmployeeMeta(1L, "Erin Employee", "Development"));
        EMPLOYEE_META.put(2L, new EmployeeMeta(2L, "Manny Manager", "Development"));
        EMPLOYEE_META.put(3L, new EmployeeMeta(3L, "Alex Admin", "HR"));

        // --- Seed some payroll records (months must match frontend e.g. "2025-12") ---
        PAYROLL_RECORDS.add(new PayrollRecord(
                ID_SEQUENCE.getAndIncrement(),
                1L,
                "2025-12",
                8000, 500, 200
        ));
        PAYROLL_RECORDS.add(new PayrollRecord(
                ID_SEQUENCE.getAndIncrement(),
                1L,
                "2025-11",
                8000, 300, 150
        ));
        PAYROLL_RECORDS.add(new PayrollRecord(
                ID_SEQUENCE.getAndIncrement(),
                2L,
                "2025-12",
                10000, 800, 300
        ));
    }

    // -----------------------------------------------------------
    // 1) Employee-level payroll: /api/employees/{id}/payroll
    //    (used by "My Payroll" for the logged-in employee)
    // -----------------------------------------------------------

    @GetMapping("/employees/{employeeId}/payroll")
    public List<PayrollRecord> getPayrollForEmployee(@PathVariable Long employeeId) {
        return PAYROLL_RECORDS.stream()
                .filter(r -> r.getEmployeeId().equals(employeeId))
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
    //    (used by Manager "Team Payroll" and HR "Admin Dashboard")
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

    private record EmployeeMeta(Long id, String name, String department) {
    }

    @GetMapping("/payroll")
    public ResponseEntity<List<GlobalPayrollRow>> getGlobalPayroll(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String department
    ) {
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