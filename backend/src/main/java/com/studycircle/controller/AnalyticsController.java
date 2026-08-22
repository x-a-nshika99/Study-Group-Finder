package com.studycircle.controller;

import com.studycircle.dto.DailyAnalyticsDto;
import com.studycircle.dto.SubjectAnalyticsDto;
import com.studycircle.dto.WeeklyAnalyticsDto;
import com.studycircle.security.CustomUserDetails;
import com.studycircle.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/daily")
    public ResponseEntity<DailyAnalyticsDto> getDailyAnalytics(@AuthenticationPrincipal CustomUserDetails userDetails) {
        DailyAnalyticsDto daily = analyticsService.getDailyAnalytics(userDetails.getUser().getId());
        return ResponseEntity.ok(daily);
    }

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyAnalyticsDto> getWeeklyAnalytics(@AuthenticationPrincipal CustomUserDetails userDetails) {
        WeeklyAnalyticsDto weekly = analyticsService.getWeeklyAnalytics(userDetails.getUser().getId());
        return ResponseEntity.ok(weekly);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectAnalyticsDto>> getSubjectAnalytics(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<SubjectAnalyticsDto> subjects = analyticsService.getSubjectAnalytics(userDetails.getUser().getId());
        return ResponseEntity.ok(subjects);
    }
}
