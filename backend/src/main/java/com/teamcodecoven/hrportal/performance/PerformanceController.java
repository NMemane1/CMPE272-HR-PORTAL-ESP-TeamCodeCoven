package com.teamcodecoven.hrportal.performance;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/employees")
public class PerformanceController {

    // In-memory performance reviews: keyed by employeeId
    private final Map<Long, List<PerformanceReview>> performanceByEmployee = new ConcurrentHashMap<>();
    private final AtomicLong perfIdSeq = new AtomicLong(1L);

    public PerformanceController() {
        // ------------------------------------------------
        // Employee User (id = 1)
        // ------------------------------------------------
        addReview(1L, 2L, "2025-Q4", 4.5,
                "Consistently delivers high-quality work and meets all project deadlines.");
        addReview(1L, 2L, "2025-Q3", 4.2,
                "Solid performance, successfully onboarded to the HR Portal project.");
        addReview(1L, 2L, "2025-Q2", 4.0,
                "Adapted to new services and contributed effectively to sprint goals.");
        addReview(1L, 2L, "2025-Q1", 4.7,
                "Strong onboarding performance and quick feature development.");

        // ------------------------------------------------
        // Manager User (id = 2)
        // ------------------------------------------------
        addReview(2L, 3L, "2025-Q4", 4.0,
                "Effectively manages the team and supports project delivery.");
        addReview(2L, 3L, "2025-Q3", 3.8,
                "Handled team activities well and improved cross-functional communication.");
        addReview(2L, 3L, "2025-Q2", 3.5,
                "Some delays in project updates; recommended better time management.");
        addReview(2L, 3L, "2025-Q1", 4.0,
                "Stable performance with growing responsibility handling.");

        // ------------------------------------------------
        // HR Admin User (id = 3)
        // ------------------------------------------------
        addReview(3L, 2L, "2025-Q4", 4.6,
                "Drives security, compliance and deployment coordination across the platform.");
        addReview(3L, 2L, "2025-Q3", 4.4,
                "Delivered strong architectural support across backend services.");
        addReview(3L, 2L, "2025-Q2", 4.0,
                "Consistent delivery but needs to document deployments more clearly.");
        addReview(3L, 2L, "2025-Q1", 4.5,
                "Key contributor to backend security workflows.");

        // ------------------------------------------------
        // Dev User (id = 4)
        // ------------------------------------------------
        addReview(4L, 2L, "2025-Q4", 4.0,
                "Strong technical delivery and reliable task completion.");
        addReview(4L, 2L, "2025-Q3", 4.3,
                "Delivered key backend components ahead of schedule.");

        // ------------------------------------------------
        // Analyst User (id = 5)
        // ------------------------------------------------
        addReview(5L, 2L, "2025-Q4", 4.0,
                "Good analytical skills and improved reporting accuracy.");
        addReview(5L, 2L, "2025-Q3", 3.4,
                "Should collaborate more closely with engineering teams.");
    }

    private void addReview(Long employeeId,
                           Long reviewerId,
                           String period,
                           double rating,
                           String comments) {

        List<PerformanceReview> list = performanceByEmployee
                .computeIfAbsent(employeeId, id -> new ArrayList<>());

        Long id = perfIdSeq.getAndIncrement();
        PerformanceReview review = new PerformanceReview(
                id,
                employeeId,
                reviewerId,
                period,
                rating,
                comments
        );
        list.add(review);
    }

    // ------------------------------------------------
    // GET /api/employees/{employeeId}/performance
    // Used by:
    //  - Employee dashboard: "My Performance"
    //  - Manager HR pages: when clicking into an employee
    //
    // No backend RBAC here: UI makes sure only allowed
    // employees are clickable for each role.
    // ------------------------------------------------
    @GetMapping("/{employeeId}/performance")
    public ResponseEntity<List<PerformanceReview>> getPerformanceReviews(
            @PathVariable Long employeeId
    ) {
        List<PerformanceReview> list = performanceByEmployee.get(employeeId);
        if (list == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        // latest period first (lexicographically works for '2025-Q4', '2025-Q3', ...)
        list.sort(Comparator.comparing(PerformanceReview::getPeriod).reversed());
        return ResponseEntity.ok(list);
    }

    // ------------------------------------------------
    // POST /api/employees/{employeeId}/performance
    // Simple demo endpoint if you want to add reviews
    // at runtime from Postman.
    // ------------------------------------------------
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

    // ------------------------------------------------
    // PUT /api/employees/{employeeId}/performance/{reviewId}
    // ------------------------------------------------
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