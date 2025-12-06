package com.teamcodecoven.hrportal.employee;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final Map<Long, Employee> employees = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(1L);

    public EmployeeController() {
        // Seed 3 employees matching your auth users
        Employee emp = new Employee(
                idSequence.getAndIncrement(),
                "Erin Employee",
                "employee@test.com",
                "Development",
                "Software Engineer",
                "ACTIVE"
        );
        employees.put(emp.getId(), emp);

        Employee manager = new Employee(
                idSequence.getAndIncrement(),
                "Manny Manager",
                "manager@test.com",
                "Development",
                "Engineering Manager",
                "ACTIVE"
        );
        employees.put(manager.getId(), manager);

        Employee admin = new Employee(
                idSequence.getAndIncrement(),
                "Alex Admin",
                "hradmin@test.com",
                "HR",
                "HR Admin",
                "ACTIVE"
        );
        employees.put(admin.getId(), admin);
    }

    @GetMapping
    public Collection<Employee> getAllEmployees() {
        return employees.values();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee emp = employees.get(id);
        if (emp == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(emp);
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee payload) {
        Long id = idSequence.getAndIncrement();
        Employee emp = new Employee(
                id,
                payload.getName(),
                payload.getEmail(),
                payload.getDepartment(),
                payload.getTitle(),
                payload.getStatus() != null ? payload.getStatus() : "ACTIVE"
        );
        employees.put(id, emp);
        return ResponseEntity.ok(emp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee payload
    ) {
        Employee existing = employees.get(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (payload.getName() != null) existing.setName(payload.getName());
        if (payload.getEmail() != null) existing.setEmail(payload.getEmail());
        if (payload.getDepartment() != null) existing.setDepartment(payload.getDepartment());
        if (payload.getTitle() != null) existing.setTitle(payload.getTitle());
        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());

        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateEmployee(@PathVariable Long id) {
        Employee existing = employees.get(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        existing.setStatus("INACTIVE");
        return ResponseEntity.ok(
                Map.of("message", "Employee deactivated", "id", id)
        );
    }

    // Helper for other controllers
    public List<Employee> getEmployeesList() {
        return new ArrayList<>(employees.values());
    }
}