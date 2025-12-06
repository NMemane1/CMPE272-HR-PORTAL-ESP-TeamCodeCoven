package com.teamcodecoven.hrportal.auth.controller;

import com.teamcodecoven.hrportal.auth.dto.LoginResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")   // ✅ allow your Vite dev frontend
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Simple DTO for the request body
    public static class LoginRequest {
        public String email;
        public String password;
    }

    // Helper to build login success payload (with userId + email)
    private LoginResponseDto buildUserResponse(Long userId,
                                               String email,
                                               String name,
                                               String role) {
        LoginResponseDto dto = new LoginResponseDto();
        dto.setUserId(userId);
        dto.setEmail(email);
        dto.setName(name);
        dto.setRole(role);
        dto.setToken(null);  // placeholder
        return dto;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.email;
        String password = request.password;

        if ("employee@test.com".equals(email) && "password123".equals(password)) {
            return ResponseEntity.ok(
                    buildUserResponse(1L, email, "Employee User", "EMPLOYEE")
            );
        }

        if ("manager@test.com".equals(email) && "password123".equals(password)) {
            return ResponseEntity.ok(
                    buildUserResponse(2L, email, "Manager User", "MANAGER")
            );
        }

        if ("hradmin@test.com".equals(email) && "password123".equals(password)) {
            return ResponseEntity.ok(
                    buildUserResponse(3L, email, "HR Admin User", "HR_ADMIN")
            );
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(java.util.Map.of("message", "Invalid credentials"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser() {
        LoginResponseDto dto = new LoginResponseDto();
        dto.setUserId(1L);
        dto.setEmail("employee@test.com");
        dto.setName("Employee User");
        dto.setRole("EMPLOYEE");
        dto.setToken(null);

        return ResponseEntity.ok(dto);
    }
}