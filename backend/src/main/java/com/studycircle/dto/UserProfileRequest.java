package com.studycircle.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileRequest {

    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Profile image URL cannot exceed 500 characters")
    private String profileImageUrl;

    @Min(value = 1, message = "Daily goal must be at least 1 minute")
    private Integer dailyGoalMinutes;

    @Size(max = 300, message = "Bio cannot exceed 300 characters")
    private String bio;
}
