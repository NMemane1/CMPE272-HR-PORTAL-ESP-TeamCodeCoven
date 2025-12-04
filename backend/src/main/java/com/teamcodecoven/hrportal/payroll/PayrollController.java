package com.teamcodecoven.hrportal.payroll;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    // simple in-memory list for demo
    private final Map<Long, Map<String, Object>> payroll = new HashMap<>();

    public PayrollController() {
        // Seed one record for testing
        Map<String, Object> p1 = new HashMap<>();
        p1.put("id", 1L);
        p1.put("employeeId", 1L);
        p1.put("salary", 120000);
        p1.put("bonus", 5000);
        payroll.put(1L, p1);
    }

    @GetMapping
    public ResponseEntity<?> getAllPayroll() {
        return ResponseEntity.ok(payroll.values());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPayrollById(@PathVariable Long id) {
        Map<String, Object> rec = payroll.get(id);
        if (rec == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Payroll record not found"));
        }
        return ResponseEntity.ok(rec);
    }

    @PostMapping
    public ResponseEntity<?> createPayroll(@RequestBody Map<String, Object> body) {
        long newId = payroll.keySet().stream().mapToLong(Long::longValue).max().orElse(0L) + 1;
        body.put("id", newId);
        payroll.put(newId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayroll(@PathVariable Long id,
                                           @RequestBody Map<String, Object> updates) {
        Map<String, Object> existing = payroll.get(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Payroll record not found"));
        }
        existing.putAll(updates);
        existing.put("id", id); // don’t let it change
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayroll(@PathVariable Long id) {
        if (!payroll.containsKey(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Payroll record not found"));
        }
        payroll.remove(id);
        return ResponseEntity.ok(Map.of("message", "Payroll deleted", "id", id));
    }
}