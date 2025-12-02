/*
package com.teamcodecoven.hrportal.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthController {

    // Show login page (GET)
    @GetMapping("/auth/login")
    public String loginPage() {
        // IMPORTANT: view name is "login123", NOT "login"
        // This maps to src/main/resources/templates/login123.html
        return "login123";
    }

    // Home after login
    @GetMapping({"/", "/home"})
    public String homePage() {
        return "home";   // src/main/resources/templates/home.html
    }
}
*/