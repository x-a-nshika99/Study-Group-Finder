package com.studycircle.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UserSubjectsRequest {

    @NotNull(message = "Subject IDs list cannot be null")
    private List<Long> subjectIds;
}
