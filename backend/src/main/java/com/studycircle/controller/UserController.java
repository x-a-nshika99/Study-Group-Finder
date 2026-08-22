package com.studycircle.controller;

import com.studycircle.dto.UserDto;
import com.studycircle.dto.UserProfileRequest;
import com.studycircle.dto.UserSubjectsRequest;
import com.studycircle.security.CustomUserDetails;
import com.studycircle.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserDto userDto = userService.getUserProfile(userDetails.getUser().getId());
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserProfileRequest request) {
        UserDto userDto = userService.updateUserProfile(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/subjects")
    public ResponseEntity<UserDto> updateSubjects(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserSubjectsRequest request) {
        UserDto userDto = userService.updateUserSubjects(userDetails.getUser().getId(), request.getSubjectIds());
        return ResponseEntity.ok(userDto);
    }
}
