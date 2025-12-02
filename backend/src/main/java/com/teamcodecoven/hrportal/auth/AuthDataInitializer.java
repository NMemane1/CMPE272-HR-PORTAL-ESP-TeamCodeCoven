package com.teamcodecoven.hrportal.auth;

import com.teamcodecoven.hrportal.auth.entity.UserAccount;
import com.teamcodecoven.hrportal.auth.repository.UserAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthDataInitializer {

    @Bean
    public CommandLineRunner initUsers(
            UserAccountRepository userRepo,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            String email = "nikita.memane@sjsu.edu";

            if (userRepo.findByEmail(email).isEmpty()) {
                UserAccount admin = new UserAccount(
                        email,
                        passwordEncoder.encode("nrm123"),  // password
                        "Nikita",
                        "ADMIN"
                );
                userRepo.save(admin);
                System.out.println("***** Created default admin user: " + email + " / nrm123");
            } else {
                System.out.println("***** Admin user already exists: " + email);
            }
        };
    }
}