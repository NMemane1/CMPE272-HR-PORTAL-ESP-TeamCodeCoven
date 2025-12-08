package com.teamcodecoven.hrportal.performance;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/employees")
public class PerformanceController {

    // In-memory store: employeeId -> list of reviews
    private final Map<Long, List<PerformanceReview>> performanceByEmployee = new ConcurrentHashMap<>();
    private final AtomicLong perfIdSeq = new AtomicLong(1L);

    // Simple in-memory directory of employees + roles
    // This mirrors the same IDs / roles you already use in auth + payroll:
    //
    // 1 -> employee@test.com (EMPLOYEE)
    // 2 -> manager@test.com  (MANAGER)
    // 3 -> hradmin@test.com  (HR_ADMIN)
    // 4,5 -> extra demo employees (no separate login, just for richer UI)
    private static final Map<Long, EmployeeMeta> EMPLOYEE_META = new HashMap<>();

    static {
        EMPLOYEE_META.put(1L, new EmployeeMeta(1L, "employee@test.com", "Erin Employee", "EMPLOYEE"));
        EMPLOYEE_META.put(2L, new EmployeeMeta(2L, "manager@test.com", "Manny Manager", "MANAGER"));
        EMPLOYEE_META.put(3L, new EmployeeMeta(3L, "hradmin@test.com", "Alex Admin", "HR_ADMIN"));
        EMPLOYEE_META.put(4L, new EmployeeMeta(4L, "dev1@company.com", "Dana Developer", "EMPLOYEE"));
        EMPLOYEE_META.put(5L, new EmployeeMeta(5L, "analyst@company.com", "Chris Analyst", "EMPLOYEE"));
    }

    public PerformanceController() {
        // --- Employee (id = 1) ---
        List<PerformanceReview> emp1 = new ArrayList<>();
        emp1.add(new PerformanceReview(
                perfIdSeq.getAndIncrement(),
                1L,
                2L,   // reviewer: manager
                "2025-Q4",
                4.5,
                "Consistently delivers high-quality work and collaborates well with the team."
        ));
        emp1.add(new PerformanceReview(
                perfIdSeq.getAndIncrement(),
                1L,
                2L,
                "2025-Q3",
                4.2,
                "Strong performance and successfully onboarded to the HR Portal project."
        ));
        performanceByEmployee.put(1L, emp1);

        // --- Manager (id = 2) ---
        List<PerformanceReview> mgr = new ArrayList<>();
        mgr.add(new PerformanceReview(
                perfIdSeq.getAndIncrement(),
                2L,
                3L,   // reviewer: HR admin
                "2025-Q4",
                4.3,
                "Effectively leads the team and supports successful delivery of HR features."
        ));
        performanceByEmployee.put(2L, mgr);

        // --- HR Admin (id = 3) ---
        List<PerformanceReview> hr = new ArrayList<>();
        hr.add(new PerformanceReview(
                perfIdSeq.getAndIncrement(),
                3L,
                2L,
                "2025-Q4",
                4.7,
                "Drives security, compliance, and deployment coordination across the platform."
        ));
        performanceByEmployee.put(3L, hr);

        // --- Dana Developer (id = 4) ---
        List<PerformanceReview> dev = new ArrayList<>();
        dev.add(new PerformanceReview(
                perfIdSeq.getAndIncrement(),
                4L,
                2L,
                "2025-Q4",
                4.1,
                "Quickly picked up new services and closed several critical tickets."
        ));
        performanceByEmployee.put(4L, dev);

        // --- Chris Analyst (id = 5) ---
        List<PerformanceReview> analyst = new ArrayList<>();
        analyst.add(new PerformanceReview(
                perfIdSeq.getAndIncrement(),
                5L,
                2L,
                "2025-Q4",
                4.0,
                "Built clear reports and dashboards that help leadership understand HR metrics."
        ));
        performanceByEmployee.put(5L, analyst);
    }

    private record EmployeeMeta(Long id, String email, String name, String role) {
    }

    // -----------------------------------------------------------
    // GET: /api/employees/{employeeId}/performance
    //
    // Optional query params:
    //   viewerId   - ID of the logged-in user (Long)
    //   viewerRole - role of logged-in user: EMPLOYEE / MANAGER / HR_ADMIN
    //
    // RBAC rules (best-effort, demo-focused):
    //   - EMPLOYEE: can only view their own reviews
    //   - MANAGER: cannot view HR admin reviews
    //   - HR_ADMIN: cannot view other HR admins' reviews (only self)
    //
    // If viewerRole is missing, we fall back to the old behavior
    // and just return the reviews (no blocking).
    // -----------------------------------------------------------
    @GetMapping("/{employeeId}/performance")
    public ResponseEntity<?> getPerformanceReviews(
            @PathVariable Long employeeId,
            @RequestParam(value = "viewerId", required = false) Long viewerId,
            @RequestParam(value = "viewerRole", required = false) String viewerRole
    ) {
        EmployeeMeta target = EMPLOYEE_META.get(employeeId);
        if (target == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Employee not found."));
        }

        // If caller passes viewerRole, enforce basic RBAC
        if (viewerRole != null && !viewerRole.isBlank()) {
            String normalizedRole = viewerRole.toUpperCase(Locale.ROOT);

            // EMPLOYEE: only own reviews
            if ("EMPLOYEE".equals(normalizedRole)) {
                if (viewerId == null || !viewerId.equals(employeeId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of(
                                    "message",
                                    "You are not allowed to view this employee's performance reviews."
                            ));
                }
            }

            // MANAGER: cannot see any HR admin reviews
            if ("MANAGER".equals(normalizedRole)) {
                if ("HR_ADMIN".equalsIgnoreCase(target.role())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of(
                                    "message",
                                    "You are not allowed to view this employee's performance reviews."
                            ));
                }
            }

            // HR_ADMIN: cannot see other HR admins' reviews (only self)
            if ("HR_ADMIN".equals(normalizedRole)) {
                if ("HR_ADMIN".equalsIgnoreCase(target.role())
                        && viewerId != null
                        && !viewerId.equals(employeeId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of(
                                    "message",
                                    "You are not allowed to view this employee's performance reviews."
                            ));
                }
            }
        }

        List<PerformanceReview> list = performanceByEmployee.get(employeeId);
        if (list == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(list);
    }

    // -----------------------------------------------------------
    // POST: /api/employees/{employeeId}/performance
    //
    // For the demo, we allow creation from whoever calls it.
    // (You are not using this from the UI right now.)
    // -----------------------------------------------------------
    @PostMapping("/{employeeId}/performance")
    public ResponseEntity<PerformanceReview> createPerformanceReview(
            @PathVariable Long employeeId,
            @RequestBody PerformanceReview payload
    ) {
        List<PerformanceReview> list = performanceByEmployee
                .computeIfAbsent(employeeId, id -> new ArrayList<>());

        Long id = perfIdSeq.getAndIncrement();
        PerformanceReview review = new PerformanceReview(
                id,
                employeeId,
                payload.getReviewerId(),
                payload.getPeriod(),
                payload.getRating(),
                payload.getComments()
        );
        list.add(review);
        return ResponseEntity.ok(review);
    }

    // -----------------------------------------------------------
    // PUT: /api/employees/{employeeId}/performance/{reviewId}
    //
    // For now, we keep this simple as well.
    // -----------------------------------------------------------
    @PutMapping("/{employeeId}/performance/{reviewId}")
    public ResponseEntity<PerformanceReview> updatePerformanceReview(
            @PathVariable Long employeeId,
            @PathVariable Long reviewId,
            @RequestBody PerformanceReview payload
    ) {
        List<PerformanceReview> list = performanceByEmployee.get(employeeId);
        if (list == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<PerformanceReview> existingOpt = list.stream()
                .filter(r -> Objects.equals(r.getId(), reviewId))
                .findFirst();

        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        PerformanceReview existing = existingOpt.get();
        if (payload.getPeriod() != null) existing.setPeriod(payload.getPeriod());
        if (payload.getComments() != null) existing.setComments(payload.getComments());
        if (payload.getRating() != 0.0) existing.setRating(payload.getRating());
        if (payload.getReviewerId() != null) existing.setReviewerId(payload.getReviewerId());

        return ResponseEntity.ok(existing);
    }
}