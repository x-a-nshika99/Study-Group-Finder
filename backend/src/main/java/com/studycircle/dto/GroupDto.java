package com.studycircle.dto;

import com.studycircle.entity.enums.GroupSessionType;
import com.studycircle.entity.enums.GroupStatus;
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
public class GroupDto {
    private Long id;
    private String name;
    private String description;
    private SubjectDto subject;
    private UserDto creator;
    private GroupSessionType sessionType;
    private LocalDateTime startTime;
    private Integer durationMinutes;
    private Integer breakDurationMinutes;
    private Integer maxMembers;
    private Integer currentMembersCount;
    private GroupStatus status;
    private List<GroupMemberDto> members;
    private LocalDateTime createdAt;
}
