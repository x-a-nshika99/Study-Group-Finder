package com.studycircle.dto;

import com.studycircle.entity.enums.GroupSessionType;
import com.studycircle.entity.enums.GroupStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateGroupRequest {

    @Size(max = 120, message = "Name cannot exceed 120 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private Long subjectId;

    private GroupSessionType sessionType;

    private LocalDateTime startTime;

    @Min(value = 5, message = "Duration must be at least 5 minutes")
    private Integer durationMinutes;

    @Min(value = 1, message = "Break duration must be at least 1 minute")
    private Integer breakDurationMinutes;

    @Min(value = 2, message = "Max members must be at least 2")
    private Integer maxMembers;

    private GroupStatus status;
}
