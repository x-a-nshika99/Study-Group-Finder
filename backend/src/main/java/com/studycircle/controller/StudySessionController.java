package com.studycircle.controller;

import com.studycircle.dto.StartSessionRequest;
import com.studycircle.dto.StopSessionRequest;
import com.studycircle.dto.StudySessionDto;
import com.studycircle.security.CustomUserDetails;
import com.studycircle.service.StudySessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studySessionService;

    @PostMapping("/start")
    public ResponseEntity<StudySessionDto> startSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody StartSessionRequest request) {
        StudySessionDto session = studySessionService.startSession(userDetails.getUser().getId(), request);
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<StudySessionDto> stopSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody(required = false) StopSessionRequest request) {
        if (request == null) {
            request = new StopSessionRequest();
        }
        StudySessionDto session = studySessionService.stopSession(userDetails.getUser().getId(), id, request);
        return ResponseEntity.ok(session);
    }

    @GetMapping
    public ResponseEntity<List<StudySessionDto>> getUserSessions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<StudySessionDto> sessions = studySessionService.getUserSessions(userDetails.getUser().getId());
        return ResponseEntity.ok(sessions);
    }
}
