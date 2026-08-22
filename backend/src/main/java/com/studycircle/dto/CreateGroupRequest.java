package com.studycircle.dto;

import com.studycircle.entity.enums.GroupSessionType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateGroupRequest {

    @NotBlank(message = "Group name is required")
    @Size(max = 120, message = "Name cannot exceed 120 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    private GroupSessionType sessionType = GroupSessionType.POMODORO;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 5, message = "Duration must be at least 5 minutes")
    private Integer durationMinutes;

    @Min(value = 1, message = "Break duration must be at least 1 minute")
    private Integer breakDurationMinutes = 5;

    @Min(value = 2, message = "Max members must be at least 2")
    private Integer maxMembers = 8;
}
