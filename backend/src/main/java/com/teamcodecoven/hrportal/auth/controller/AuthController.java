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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // ⚠️ Demo logic: hard-coded check for now
        if ("nikita.memane@sjsu.edu".equals(request.email)
                && "nrm123".equals(request.password)) {

            // This JSON is what frontend / Postman will see
            return ResponseEntity.ok(
                    Map.of(
                            "email", request.email,
                            "name", "Nikita Memane",
                            "role", "EMPLOYEE",
                            "message", "Login successful"
                    )
            );
        }

        // Wrong credentials
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid credentials"));
    }
}