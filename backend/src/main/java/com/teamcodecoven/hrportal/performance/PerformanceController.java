package com.teamcodecoven.hrportal.performance;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/employees")
public class PerformanceController {

    private final Map<Long, List<PerformanceReview>> performanceByEmployee = new ConcurrentHashMap<>();
    private final AtomicLong perfIdSeq = new AtomicLong(1L);

    public PerformanceController() {
        // Seed a couple of reviews for employeeId = 1
        List<PerformanceReview> emp1 = new ArrayList<>();
        emp1.add(new PerformanceReview(
                perfIdSeq.getAndIncrement(),
                1L,
                2L, // reviewer: manager
                "2024-H1",
                4.5,
                "Great team player and consistently meets expectations."
        ));
        emp1.add(new PerformanceReview(
                perfIdSeq.getAndIncrement(),
                1L,
                2L,
                "2023-H2",
                4.2,
                "Strong performance and good collaboration across teams."
        ));
        performanceByEmployee.put(1L, emp1);
    }

    @GetMapping("/{employeeId}/performance")
    public ResponseEntity<List<PerformanceReview>> getPerformanceReviews(
            @PathVariable Long employeeId
    ) {
        List<PerformanceReview> list = performanceByEmployee.get(employeeId);
        if (list == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(list);
    }

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