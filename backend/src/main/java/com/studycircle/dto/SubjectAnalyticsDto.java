package com.studycircle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectAnalyticsDto {
    private Long subjectId;
    private String subjectName;
    private String colorHex;
    private int totalMinutesStudied;
    private double percentage;
}
