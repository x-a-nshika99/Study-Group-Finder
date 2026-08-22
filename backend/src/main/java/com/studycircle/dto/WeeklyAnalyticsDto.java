package com.studycircle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyAnalyticsDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalMinutesThisWeek;
    private List<DailyBreakdown> dailyBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyBreakdown {
        private String dayOfWeek; // e.g. "Mon", "Tue"
        private LocalDate date;
        private int minutesStudied;
    }
}
