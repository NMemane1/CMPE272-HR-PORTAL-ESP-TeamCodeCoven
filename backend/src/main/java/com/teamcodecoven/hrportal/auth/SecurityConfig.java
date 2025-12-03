package com.teamcodecoven.hrportal.auth;

import com.teamcodecoven.hrportal.auth.entity.UserAccount;
import com.teamcodecoven.hrportal.auth.repository.UserAccountRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1) Load users from USERS table by email
    @Bean
    public UserDetailsService userDetailsService(UserAccountRepository userRepo) {
        return username -> {
            UserAccount user = userRepo.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

            return User.withUsername(user.getEmail())
                    .password(user.getPasswordHash())   // BCrypt hash from DB
                    .roles(user.getRole())              // e.g. "ADMIN"
                    .build();
        };
    }

    // 2) Password encoder (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 3) Authentication provider
    @Bean
    public DaoAuthenticationProvider authProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    // 4) HTTP security rules – use DEFAULT Spring login page at /login
   @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // We are using a JSON API (React frontend), so disable CSRF tokens
        .csrf(csrf -> csrf.disable())

        // Authorization rules
        .authorizeHttpRequests(auth -> auth
            // Allow login endpoint + H2 console + error page without auth
            .requestMatchers(
                "/api/auth/login",
                "/h2-console/**",
                "/error"
            ).permitAll()
            // Everything else requires authentication
            .anyRequest().authenticated()
        )

        // (Optional) form login if you still want Spring's default login page
        .formLogin(form -> form
            .loginPage("/login")   // or remove this line if you use only React login
            .permitAll()
        )

        .logout(logout -> logout
            .logoutUrl("/logout")
            .permitAll()
        );

    // Needed so H2 console works inside a frame
    http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

    return http.build();
}
}