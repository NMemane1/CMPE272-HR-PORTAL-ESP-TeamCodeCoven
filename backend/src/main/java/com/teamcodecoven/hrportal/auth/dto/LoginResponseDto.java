package com.teamcodecoven.hrportal.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {

    private Long userId;
    private String name;
    private String email;
    private String role;
    private String token;   // placeholder
}