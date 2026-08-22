package com.studycircle.service;

import com.studycircle.dto.AuthResponse;
import com.studycircle.dto.LoginRequest;
import com.studycircle.dto.RegisterRequest;
import com.studycircle.dto.UserDto;
import com.studycircle.entity.User;
import com.studycircle.exception.BadRequestException;
import com.studycircle.exception.ResourceNotFoundException;
import com.studycircle.exception.UnauthorizedException;
import com.studycircle.repository.UserRepository;
import com.studycircle.security.CookieUtils;
import com.studycircle.security.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final CookieUtils cookieUtils;
    private final UserService userService;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletRequest httpRequest, HttpServletResponse response) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already in use.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .dailyGoalMinutes(120)
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getId());
        ResponseCookie cookie = cookieUtils.createJwtCookie(token, httpRequest.isSecure());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        UserDto userDto = userService.mapToUserDto(savedUser);
        return AuthResponse.builder()
                .message("User registered successfully")
                .user(userDto)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getId());
        ResponseCookie cookie = cookieUtils.createJwtCookie(token, httpRequest.isSecure());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        UserDto userDto = userService.mapToUserDto(user);
        return AuthResponse.builder()
                .message("Login successful")
                .user(userDto)
                .build();
    }

    public void logout(HttpServletRequest httpRequest, HttpServletResponse response) {
        ResponseCookie cookie = cookieUtils.createCleanJwtCookie(httpRequest.isSecure());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userService.mapToUserDto(user);
    }
}
