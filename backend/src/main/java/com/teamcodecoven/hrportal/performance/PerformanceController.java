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
        // Employee User (id = 1) – ENGINEERING EMPLOYEE
        // ------------------------------------------------
        addReview(1L, 2L, "2025-Q4", 4.5,
            "Consistently delivers high-quality features and collaborates effectively with teammates.");
        addReview(1L, 2L, "2025-Q3", 4.2,
            "Strong sprint execution and improved ownership of end-to-end tasks.");
        addReview(1L, 2L, "2025-Q2", 4.0,
            "Meets expectations across delivery, documentation and testing.");
        addReview(1L, 2L, "2025-Q1", 4.7,
            "Excellent onboarding performance, quickly productive in new services.");

        // ------------------------------------------------
        // Manager User (id = 2) – ENGINEERING MANAGER
        // ------------------------------------------------
        addReview(2L, 3L, "2025-Q4", 4.0,
            "Proactively supports team execution and ensures successful delivery cycles.");
        addReview(2L, 3L, "2025-Q3", 3.8,
            "Strengthened cross-functional collaboration and improved project visibility.");
        addReview(2L, 3L, "2025-Q2", 3.5,
            "Encouraged to improve planning accuracy and dependency management.");
        addReview(2L, 3L, "2025-Q1", 4.0,
            "Stable performance with emphasis on team support and clarity of execution.");

        // ------------------------------------------------
        // HR Admin User (id = 3) – CLEAN HR-FOCUSED REVIEWS
        // ------------------------------------------------
        addReview(3L, 2L, "2025-Q4", 4.6,
            "Leads organization-wide HR strategy including policy updates, compliance reviews, and leadership calibration cycles.");
        addReview(3L, 2L, "2025-Q3", 4.2,
            "Successfully closed multiple hiring loops and improved onboarding experience for new hires.");
        addReview(3L, 2L, "2025-Q2", 4.0,
            "Handled benefits refresh, manager training, and cross-team communication effectively.");
        addReview(3L, 2L, "2025-Q1", 4.5,
            "Built and led HR portal rollout plan with strong adoption results.");
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
    // ------------------------------------------------
    @GetMapping("/{employeeId}/performance")
    public ResponseEntity<List<PerformanceReview>> getPerformanceReviews(
            @PathVariable Long employeeId
    ) {
        List<PerformanceReview> list = performanceByEmployee.get(employeeId);
        if (list == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        list.sort(Comparator.comparing(PerformanceReview::getPeriod).reversed());
        return ResponseEntity.ok(list);
    }

    // ------------------------------------------------
    // POST /api/employees/{employeeId}/performance
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