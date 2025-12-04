package com.teamcodecoven.hrportal.employee;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    // Simple in-memory Employee model
    public static class Employee {
        public Long id;
        public String name;
        public String email;
        public String department;
        public String title;
        public String status;

        public Employee(Long id,
                        String name,
                        String email,
                        String department,
                        String title,
                        String status) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.department = department;
            this.title = title;
            this.status = status;
        }
    }

    // Request DTO (for POST / PUT)
    public static class EmployeeRequest {
        public String name;
        public String email;
        public String department;
        public String title;
        public String status; // optional; default ACTIVE
    }

    // Mock in-memory list
    private static final List<Employee> EMPLOYEES = new ArrayList<>();

    static {
        EMPLOYEES.add(new Employee(
                1L,
                "Erin Employee",
                "employee@company.com",
                "Development",
                "Software Engineer",
                "ACTIVE"
        ));
        EMPLOYEES.add(new Employee(
                2L,
                "Manny Manager",
                "manager@company.com",
                "Development",
                "Engineering Manager",
                "ACTIVE"
        ));
    }

    // ---------- GET all ----------
    @GetMapping
    public List<Employee> getAllEmployees() {
        return EMPLOYEES;
    }

    // ---------- GET by id ----------
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
        return EMPLOYEES.stream()
                .filter(e -> e.id.equals(id))
                .findFirst()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Employee not found")));
    }

    // ---------- POST (create) ----------
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody EmployeeRequest req) {
        long nextId = EMPLOYEES.stream()
                .mapToLong(e -> e.id)
                .max()
                .orElse(0L) + 1;

        Employee e = new Employee(
                nextId,
                req.name,
                req.email,
                req.department,
                req.title,
                req.status != null ? req.status : "ACTIVE"
        );
        EMPLOYEES.add(e);
        return ResponseEntity.status(HttpStatus.CREATED).body(e);
    }

    // ---------- PUT (update) ----------
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeRequest req
    ) {
        for (Employee e : EMPLOYEES) {
            if (e.id.equals(id)) {
                // Only update fields that are provided (non-null)
                if (req.name != null) e.name = req.name;
                if (req.email != null) e.email = req.email;
                if (req.department != null) e.department = req.department;
                if (req.title != null) e.title = req.title;
                if (req.status != null) e.status = req.status;

                return ResponseEntity.ok(e);
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Employee not found"));
    }

    // ---------- DELETE ----------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        boolean removed = EMPLOYEES.removeIf(e -> e.id.equals(id));

        if (!removed) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Employee not found"));
        }

        // For demo, return a simple JSON instead of empty 204
        return ResponseEntity.ok(Map.of(
                "message", "Employee deleted",
                "id", id
        ));
    }
}