package com.teamcodecoven.hrportal.payroll;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api")
public class PayrollController {

    // employeeId -> list of payroll records
    private final Map<Long, List<PayrollRecord>> payrollByEmployee = new ConcurrentHashMap<>();
    private final AtomicLong payrollIdSeq = new AtomicLong(1L);

    public PayrollController() {
        // Seed some example payroll for employeeId = 1
        List<PayrollRecord> emp1 = new ArrayList<>();
        emp1.add(new PayrollRecord(
                payrollIdSeq.getAndIncrement(),
                1L,
                "2025-11",
                8000,
                500,
                200,
                8000 + 500 - 200
        ));
        emp1.add(new PayrollRecord(
                payrollIdSeq.getAndIncrement(),
                1L,
                "2025-10",
                8000,
                300,
                150,
                8000 + 300 - 150
        ));
        payrollByEmployee.put(1L, emp1);
    }

    // -------------------------------------------------
    // 1) Per-employee payroll (used by My Payroll, etc.)
    // -------------------------------------------------

    @GetMapping("/employees/{employeeId}/payroll")
    public ResponseEntity<List<PayrollRecord>> getPayrollForEmployee(
            @PathVariable Long employeeId
    ) {
        List<PayrollRecord> list = payrollByEmployee.get(employeeId);
        if (list == null) {
            // 200 with empty list → UI shows "No payroll records"
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/employees/{employeeId}/payroll")
    public ResponseEntity<PayrollRecord> createPayrollRecord(
            @PathVariable Long employeeId,
            @RequestBody PayrollRecord payload
    ) {
        List<PayrollRecord> list = payrollByEmployee
                .computeIfAbsent(employeeId, id -> new ArrayList<>());

        Long id = payrollIdSeq.getAndIncrement();
        double baseSalary = payload.getBaseSalary();
        double bonus = payload.getBonus();
        double deductions = payload.getDeductions();
        double netPay = baseSalary + bonus - deductions;

        PayrollRecord record = new PayrollRecord(
                id,
                employeeId,
                payload.getMonth(),
                baseSalary,
                bonus,
                deductions,
                netPay
        );
        list.add(record);
        return ResponseEntity.ok(record);
    }

    // -------------------------------------------------
    // 2) Global payroll (used by Admin Dashboard & Team Payroll)
    //    Called as: GET /api/payroll?month=YYYY-MM&department=Dept
    // -------------------------------------------------

    @GetMapping("/payroll")
    public ResponseEntity<List<Map<String, Object>>> getGlobalPayroll(
            @RequestParam(name = "month", required = false) String month,
            @RequestParam(name = "department", required = false) String department
    ) {
        // For your demo, we keep this very simple:
        // - Flatten all payroll records
        // - Optionally filter by month (ignore department for now)
        // - Return lightweight summary objects that match frontend expectations

        List<Map<String, Object>> result = new ArrayList<>();

        for (List<PayrollRecord> records : payrollByEmployee.values()) {
            for (PayrollRecord r : records) {

                if (month != null && !month.isBlank() && !month.equals(r.getMonth())) {
                    continue; // skip different months
                }

                Map<String, Object> item = new HashMap<>();
                item.put("id", r.getId());
                item.put("employeeId", r.getEmployeeId());
                item.put("employeeName", "Employee " + r.getEmployeeId()); // simple label
                item.put("department", "Development"); // demo value
                item.put("month", r.getMonth());
                item.put("netPay", r.getNetPay());

                result.add(item);
            }
        }

        // If there are no matching records, we still return 200 with [].
        // Frontend will show "No payroll records found for this month" but NO red error.
        return ResponseEntity.ok(result);
    }
}