package com.studycircle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyAnalyticsDto {
    private LocalDate date;
    private int totalMinutesStudied;
    private int dailyGoalMinutes;
    private int completedSessionsCount;
    private int currentStreakDays;
}
