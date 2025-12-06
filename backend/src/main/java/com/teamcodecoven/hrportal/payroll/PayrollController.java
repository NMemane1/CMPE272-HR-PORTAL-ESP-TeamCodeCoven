package com.teamcodecoven.hrportal.payroll;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/employees")
public class PayrollController {

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

    @GetMapping("/{employeeId}/payroll")
    public ResponseEntity<List<PayrollRecord>> getPayrollForEmployee(
            @PathVariable Long employeeId
    ) {
        List<PayrollRecord> list = payrollByEmployee.get(employeeId);
        if (list == null) {
            // Return empty list instead of 404 so UI doesn't scream
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{employeeId}/payroll")
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
}