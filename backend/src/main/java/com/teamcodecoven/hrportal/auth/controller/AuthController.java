package com.teamcodecoven.hrportal.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Simple DTO for the request body
    public static class LoginRequest {
        public String email;
        public String password;
    }

    // Helper to build a standard login success payload
    private Map<String, Object> buildUserResponse(String email,
                                                  String name,
                                                  String role) {
        return Map.of(
                "email", email,
                "name", name,
                "role", role,
                "message", "Login successful"
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.email;
        String password = request.password;

        // 🔹 Dummy users for RBAC testing (for Shilpa)
        if ("employee@test.com".equals(email) && "password123".equals(password)) {
            return ResponseEntity.ok(
                    buildUserResponse(email, "Employee User", "EMPLOYEE")
            );
        }

        if ("manager@test.com".equals(email) && "password123".equals(password)) {
            return ResponseEntity.ok(
                    buildUserResponse(email, "Manager User", "MANAGER")
            );
        }

        if ("hradmin@test.com".equals(email) && "password123".equals(password)) {
            return ResponseEntity.ok(
                    buildUserResponse(email, "HR Admin User", "HR_ADMIN")
            );
        }

        // ❌ Anything else = invalid credentials
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid credentials"));
    }

    // Simple "current user" endpoint (still a dummy user)
    @GetMapping("/me")
    public ResponseEntity<?> currentUser() {
        return ResponseEntity.ok(
                Map.of(
                        "email", "employee@test.com",
                        "name", "Employee User",
                        "role", "EMPLOYEE"
                )
        );
    }
}