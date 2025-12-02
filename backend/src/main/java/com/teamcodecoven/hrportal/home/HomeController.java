package com.teamcodecoven.hrportal.home;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/home")
    public String homePage() {
        // Will resolve to src/main/resources/templates/home.html
        return "home";
    }
}