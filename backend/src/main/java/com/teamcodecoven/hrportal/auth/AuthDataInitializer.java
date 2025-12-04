package com.teamcodecoven.hrportal.auth;

import com.teamcodecoven.hrportal.auth.entity.UserAccount;
import com.teamcodecoven.hrportal.auth.repository.UserAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class AuthDataInitializer implements CommandLineRunner {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthDataInitializer(UserAccountRepository userRepo,
                               PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed three test users for Shilpa's RBAC tests

        seedUser(
                "employee@test.com",
                "Employee User",
                "password123",
                "EMPLOYEE"
        );

        seedUser(
                "manager@test.com",
                "Manager User",
                "password123",
                "MANAGER"
        );

        seedUser(
                "hradmin@test.com",
                "HR Admin User",
                "password123",
                "HR_ADMIN"
        );
    }

    private void seedUser(String email,
                          String name,
                          String rawPassword,
                          String role) {

        // If user already exists, don't create a duplicate
        if (userRepo.findByEmail(email).isPresent()) {
            return;
        }

        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setName(name); // ⭐ IMPORTANT: NAME IS NOT NULL IN DB
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);

        userRepo.save(user);
    }
}