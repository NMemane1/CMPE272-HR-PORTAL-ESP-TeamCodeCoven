package com.teamcodecoven.hrportal.performance;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    // In-memory mock data for demo
    private final Map<Long, Map<String, Object>> reviews = new HashMap<>();

    public PerformanceController() {
        Map<String, Object> r1 = new HashMap<>();
        r1.put("id", 1L);
        r1.put("employeeId", 1L);
        r1.put("rating", "EXCEEDS_EXPECTATIONS");
        r1.put("comments", "Great collaborator, strong technical skills");
        reviews.put(1L, r1);
    }

    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        return ResponseEntity.ok(reviews.values());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReview(@PathVariable Long id) {
        Map<String, Object> review = reviews.get(id);
        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Performance review not found"));
        }
        return ResponseEntity.ok(review);
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> body) {
        long newId = reviews.keySet().stream().mapToLong(Long::longValue).max().orElse(0L) + 1;
        body.put("id", newId);
        reviews.put(newId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id,
                                          @RequestBody Map<String, Object> updates) {
        Map<String, Object> existing = reviews.get(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Performance review not found"));
        }
        existing.putAll(updates);
        existing.put("id", id);
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        if (!reviews.containsKey(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Performance review not found"));
        }
        reviews.remove(id);
        return ResponseEntity.ok(Map.of("message", "Performance review deleted", "id", id));
    }
}