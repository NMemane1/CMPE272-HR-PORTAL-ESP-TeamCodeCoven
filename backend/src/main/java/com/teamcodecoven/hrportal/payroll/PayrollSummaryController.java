package com.teamcodecoven.hrportal.payroll;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
public class PayrollSummaryController {

    /**
     * Global payroll endpoint used by:
     *  - HR Admin dashboard
     *  - Team Payroll views
     *
     * For the purposes of this project demo, we simply return an empty list
     * so the frontend shows "No payroll records found" instead of a 404 error.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getGlobalPayroll(
            @RequestParam(name = "month", required = false) String month,
            @RequestParam(name = "department", required = false) String department
    ) {
        // You could later plug in real aggregation here.
        return ResponseEntity.ok(Collections.emptyList());
    }
}