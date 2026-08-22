package com.studycircle.dto;

import com.studycircle.entity.enums.StudySessionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartSessionRequest {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    private Long groupId; // null = solo session

    @NotNull(message = "Session type is required")
    private StudySessionType sessionType;
}
