package com.studycircle.dto;

import com.studycircle.entity.enums.MemberRole;
import com.studycircle.entity.enums.MemberStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDto {
    private Long id;
    private UserDto user;
    private MemberRole role;
    private MemberStatus status;
    private LocalDateTime joinedAt;
}
