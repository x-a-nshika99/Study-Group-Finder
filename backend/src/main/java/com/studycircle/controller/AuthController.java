package com.studycircle.controller;

import com.studycircle.dto.AuthResponse;
import com.studycircle.dto.LoginRequest;
import com.studycircle.dto.RegisterRequest;
import com.studycircle.dto.UserDto;
import com.studycircle.security.CustomUserDetails;
import com.studycircle.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request, httpRequest, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, httpRequest, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest, HttpServletResponse response) {
        authService.logout(httpRequest, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserDto userDto = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(userDto);
    }
}
