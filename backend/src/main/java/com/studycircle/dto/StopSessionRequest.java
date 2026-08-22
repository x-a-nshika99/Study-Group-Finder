package com.studycircle.dto;

import com.studycircle.entity.enums.StudySessionStatus;
import lombok.Data;

@Data
public class StopSessionRequest {
    private StudySessionStatus status = StudySessionStatus.COMPLETED;
}
