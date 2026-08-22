package com.studycircle.dto;

import com.studycircle.entity.enums.StudySessionStatus;
import com.studycircle.entity.enums.StudySessionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionDto {
    private Long id;
    private UserDto user;
    private SubjectDto subject;
    private Long groupId;
    private String groupName;
    private StudySessionType sessionType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private StudySessionStatus status;
    private LocalDateTime createdAt;
}
