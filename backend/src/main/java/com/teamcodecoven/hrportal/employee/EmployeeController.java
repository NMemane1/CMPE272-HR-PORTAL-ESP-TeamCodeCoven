package com.teamcodecoven.hrportal.employee;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    // Simple in-memory "DB" just for demo
    private static final List<Map<String, Object>> EMPLOYEES = new ArrayList<>();

    static {
        // id 1 – Erin Employee
        Map<String, Object> e1 = new HashMap<>();
        e1.put("id", 1L);
        e1.put("name", "Erin Employee");
        e1.put("email", "employee@company.com");
        e1.put("department", "Development");
        e1.put("title", "Software Engineer");
        e1.put("status", "ACTIVE");
        EMPLOYEES.add(e1);

        // id 2 – Manny Manager
        Map<String, Object> e2 = new HashMap<>();
        e2.put("id", 2L);
        e2.put("name", "Manny Manager");
        e2.put("email", "manager@company.com");
        e2.put("department", "Development");
        e2.put("title", "Engineering Manager");
        e2.put("status", "ACTIVE");
        EMPLOYEES.add(e2);
    }

    // 1) GET /api/employees – list all
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllEmployees() {
        return ResponseEntity.ok(EMPLOYEES);
    }

    // 2) GET /api/employees/{id} – find one
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
        return EMPLOYEES.stream()
                .filter(e -> e.get("id").equals(id))
                .findFirst()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of("message", "Employee not found"))
                );
    }

    // 3) POST /api/employees – create a new one (dummy)
    @PostMapping
    public ResponseEntity<Map<String, Object>> createEmployee(@RequestBody Map<String, Object> payload) {
        long newId = EMPLOYEES.size() + 1L;
        Map<String, Object> newEmp = new HashMap<>(payload);
        newEmp.put("id", newId);
        if (!newEmp.containsKey("status")) {
            newEmp.put("status", "ACTIVE");
        }
        EMPLOYEES.add(newEmp);
        return ResponseEntity.status(HttpStatus.CREATED).body(newEmp);
    }
}