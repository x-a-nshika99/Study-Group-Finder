package com.studycircle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String profileImageUrl;
    private Integer dailyGoalMinutes;
    private String bio;
    private List<SubjectDto> subjects;
    private LocalDateTime createdAt;
}
