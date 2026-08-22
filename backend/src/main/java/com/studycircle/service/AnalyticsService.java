package com.studycircle.service;

import com.studycircle.dto.DailyAnalyticsDto;
import com.studycircle.dto.SubjectAnalyticsDto;
import com.studycircle.dto.WeeklyAnalyticsDto;
import com.studycircle.entity.StudySession;
import com.studycircle.entity.Subject;
import com.studycircle.entity.User;
import com.studycircle.exception.ResourceNotFoundException;
import com.studycircle.repository.StudySessionRepository;
import com.studycircle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final StudySessionRepository studySessionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DailyAnalyticsDto getDailyAnalytics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<StudySession> todaySessions = studySessionRepository.findByUserIdAndDateRange(userId, startOfDay, endOfDay);

        int totalMinutesStudied = todaySessions.stream()
                .filter(s -> s.getDurationMinutes() != null)
                .mapToInt(StudySession::getDurationMinutes)
                .sum();

        int completedSessionsCount = (int) todaySessions.stream()
                .filter(s -> s.getDurationMinutes() != null && s.getDurationMinutes() > 0)
                .count();

        int streak = calculateStreak(userId);

        return DailyAnalyticsDto.builder()
                .date(today)
                .totalMinutesStudied(totalMinutesStudied)
                .dailyGoalMinutes(user.getDailyGoalMinutes() != null ? user.getDailyGoalMinutes() : 120)
                .completedSessionsCount(completedSessionsCount)
                .currentStreakDays(streak)
                .build();
    }

    @Transactional(readOnly = true)
    public WeeklyAnalyticsDto getWeeklyAnalytics(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.minusDays(6); // Past 7 days including today

        LocalDateTime since = startOfWeek.atStartOfDay();
        List<StudySession> sessions = studySessionRepository.findByUserIdAndStartTimeAfter(userId, since);

        Map<LocalDate, Integer> dailyMinutesMap = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            dailyMinutesMap.put(startOfWeek.plusDays(i), 0);
        }

        int totalMinutesThisWeek = 0;
        for (StudySession s : sessions) {
            if (s.getDurationMinutes() != null && s.getStartTime() != null) {
                LocalDate sessionDate = s.getStartTime().toLocalDate();
                if (dailyMinutesMap.containsKey(sessionDate)) {
                    dailyMinutesMap.put(sessionDate, dailyMinutesMap.get(sessionDate) + s.getDurationMinutes());
                    totalMinutesThisWeek += s.getDurationMinutes();
                }
            }
        }

        List<WeeklyAnalyticsDto.DailyBreakdown> breakdown = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = startOfWeek.plusDays(i);
            String dayOfWeek = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            breakdown.add(WeeklyAnalyticsDto.DailyBreakdown.builder()
                    .dayOfWeek(dayOfWeek)
                    .date(d)
                    .minutesStudied(dailyMinutesMap.getOrDefault(d, 0))
                    .build());
        }

        return WeeklyAnalyticsDto.builder()
                .startDate(startOfWeek)
                .endDate(today)
                .totalMinutesThisWeek(totalMinutesThisWeek)
                .dailyBreakdown(breakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SubjectAnalyticsDto> getSubjectAnalytics(Long userId) {
        List<StudySession> sessions = studySessionRepository.findByUserIdOrderByStartTimeDesc(userId);

        Map<Subject, Integer> subjectMinutesMap = new HashMap<>();
        int grandTotalMinutes = 0;

        for (StudySession session : sessions) {
            if (session.getDurationMinutes() != null && session.getSubject() != null) {
                Subject subject = session.getSubject();
                subjectMinutesMap.put(subject, subjectMinutesMap.getOrDefault(subject, 0) + session.getDurationMinutes());
                grandTotalMinutes += session.getDurationMinutes();
            }
        }

        final int finalGrandTotal = grandTotalMinutes;
        return subjectMinutesMap.entrySet().stream()
                .map(entry -> {
                    Subject subject = entry.getKey();
                    int minutes = entry.getValue();
                    double pct = finalGrandTotal > 0 ? (minutes * 100.0) / finalGrandTotal : 0.0;
                    return SubjectAnalyticsDto.builder()
                            .subjectId(subject.getId())
                            .subjectName(subject.getName())
                            .colorHex(subject.getColorHex())
                            .totalMinutesStudied(minutes)
                            .percentage(Math.round(pct * 10.0) / 10.0)
                            .build();
                })
                .sorted(Comparator.comparingInt(SubjectAnalyticsDto::getTotalMinutesStudied).reversed())
                .collect(Collectors.toList());
    }

    private int calculateStreak(Long userId) {
        List<StudySession> allSessions = studySessionRepository.findByUserIdOrderByStartTimeDesc(userId);
        if (allSessions.isEmpty()) {
            return 0;
        }

        Set<LocalDate> activeDates = allSessions.stream()
                .filter(s -> s.getDurationMinutes() != null && s.getDurationMinutes() > 0)
                .map(s -> s.getStartTime().toLocalDate())
                .collect(Collectors.toSet());

        LocalDate checkDate = LocalDate.now();
        if (!activeDates.contains(checkDate)) {
            checkDate = checkDate.minusDays(1);
        }

        int streak = 0;
        while (activeDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }
}
