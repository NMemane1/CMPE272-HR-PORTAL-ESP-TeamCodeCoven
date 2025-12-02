package com.teamcodecoven.hrportal.auth.service;

import com.teamcodecoven.hrportal.auth.entity.UserAccount;
import com.teamcodecoven.hrportal.auth.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DbUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userRepo;

    public DbUserDetailsService(UserAccountRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // we use EMAIL as the username
        UserAccount user = userRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return User.withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole()) // assuming ROLE column holds something like "ADMIN" or "EMPLOYEE"
                .build();
    }
}