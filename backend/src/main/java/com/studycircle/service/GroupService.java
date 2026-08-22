package com.studycircle.service;

import com.studycircle.dto.CreateGroupRequest;
import com.studycircle.dto.GroupDto;
import com.studycircle.dto.GroupMemberDto;
import com.studycircle.dto.UpdateGroupRequest;
import com.studycircle.entity.GroupMember;
import com.studycircle.entity.StudyGroup;
import com.studycircle.entity.Subject;
import com.studycircle.entity.User;
import com.studycircle.entity.enums.GroupStatus;
import com.studycircle.entity.enums.MemberRole;
import com.studycircle.entity.enums.MemberStatus;
import com.studycircle.exception.BadRequestException;
import com.studycircle.exception.ForbiddenException;
import com.studycircle.exception.ResourceNotFoundException;
import com.studycircle.repository.GroupMemberRepository;
import com.studycircle.repository.GroupRepository;
import com.studycircle.repository.SubjectRepository;
import com.studycircle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final SubjectService subjectService;

    @Transactional
    public GroupDto createGroup(Long creatorId, CreateGroupRequest request) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator not found"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        StudyGroup group = StudyGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .subject(subject)
                .creator(creator)
                .sessionType(request.getSessionType())
                .startTime(request.getStartTime())
                .durationMinutes(request.getDurationMinutes())
                .breakDurationMinutes(request.getBreakDurationMinutes() != null ? request.getBreakDurationMinutes() : 5)
                .maxMembers(request.getMaxMembers() != null ? request.getMaxMembers() : 8)
                .status(GroupStatus.SCHEDULED)
                .build();

        StudyGroup savedGroup = groupRepository.save(group);

        // Add creator as HOST
        GroupMember creatorMember = GroupMember.builder()
                .group(savedGroup)
                .user(creator)
                .role(MemberRole.HOST)
                .status(MemberStatus.JOINED)
                .joinedAt(LocalDateTime.now())
                .build();
        groupMemberRepository.save(creatorMember);

        return getGroupById(savedGroup.getId());
    }

    @Transactional(readOnly = true)
    public List<GroupDto> searchGroups(Long subjectId, GroupStatus status, LocalDateTime startAfter, LocalDateTime startBefore) {
        List<StudyGroup> groups = groupRepository.findGroupsByFilters(subjectId, status, startAfter, startBefore);
        return groups.stream().map(this::mapToGroupDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupDto getGroupById(Long groupId) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));
        return mapToGroupDto(group);
    }

    @Transactional
    public GroupDto updateGroup(Long userId, Long groupId, UpdateGroupRequest request) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (!group.getCreator().getId().equals(userId)) {
            throw new ForbiddenException("Only the creator (HOST) can edit this study group");
        }

        if (request.getName() != null) group.setName(request.getName());
        if (request.getDescription() != null) group.setDescription(request.getDescription());
        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
            group.setSubject(subject);
        }
        if (request.getSessionType() != null) group.setSessionType(request.getSessionType());
        if (request.getStartTime() != null) group.setStartTime(request.getStartTime());
        if (request.getDurationMinutes() != null) group.setDurationMinutes(request.getDurationMinutes());
        if (request.getBreakDurationMinutes() != null) group.setBreakDurationMinutes(request.getBreakDurationMinutes());
        if (request.getMaxMembers() != null) group.setMaxMembers(request.getMaxMembers());
        if (request.getStatus() != null) group.setStatus(request.getStatus());

        groupRepository.save(group);
        return mapToGroupDto(group);
    }

    @Transactional
    public void deleteGroup(Long userId, Long groupId) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (!group.getCreator().getId().equals(userId)) {
            throw new ForbiddenException("Only the creator (HOST) can delete this study group");
        }

        group.setStatus(GroupStatus.CANCELLED);
        groupRepository.save(group);
    }

    @Transactional
    public GroupDto joinGroup(Long userId, Long groupId) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (group.getStatus() == GroupStatus.COMPLETED || group.getStatus() == GroupStatus.CANCELLED) {
            throw new BadRequestException("Cannot join a group that is COMPLETED or CANCELLED");
        }

        long currentCount = groupMemberRepository.countByGroupIdAndStatus(groupId, MemberStatus.JOINED);
        if (currentCount >= group.getMaxMembers()) {
            throw new BadRequestException("Group has reached maximum capacity of " + group.getMaxMembers() + " members");
        }

        Optional<GroupMember> existingMember = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (existingMember.isPresent()) {
            GroupMember member = existingMember.get();
            if (member.getStatus() == MemberStatus.JOINED) {
                throw new BadRequestException("User is already a member of this study group");
            } else {
                member.setStatus(MemberStatus.JOINED);
                member.setJoinedAt(LocalDateTime.now());
                member.setLeftAt(null);
                groupMemberRepository.save(member);
            }
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            GroupMember newMember = GroupMember.builder()
                    .group(group)
                    .user(user)
                    .role(MemberRole.MEMBER)
                    .status(MemberStatus.JOINED)
                    .joinedAt(LocalDateTime.now())
                    .build();
            groupMemberRepository.save(newMember);
        }

        return getGroupById(groupId);
    }

    @Transactional
    public void leaveGroup(Long userId, Long groupId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member record not found"));

        if (member.getRole() == MemberRole.HOST) {
            throw new BadRequestException("Creator (HOST) cannot leave the group. Cancel the group instead.");
        }

        member.setStatus(MemberStatus.LEFT);
        member.setLeftAt(LocalDateTime.now());
        groupMemberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public GroupDto mapToGroupDto(StudyGroup group) {
        List<GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(group.getId(), MemberStatus.JOINED);
        
        List<GroupMemberDto> memberDtos = activeMembers.stream()
                .map(m -> GroupMemberDto.builder()
                        .id(m.getId())
                        .user(userService.mapToUserDto(m.getUser()))
                        .role(m.getRole())
                        .status(m.getStatus())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .collect(Collectors.toList());

        return GroupDto.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .subject(subjectService.mapToDto(group.getSubject()))
                .creator(userService.mapToUserDto(group.getCreator()))
                .sessionType(group.getSessionType())
                .startTime(group.getStartTime())
                .durationMinutes(group.getDurationMinutes())
                .breakDurationMinutes(group.getBreakDurationMinutes())
                .maxMembers(group.getMaxMembers())
                .currentMembersCount(activeMembers.size())
                .status(group.getStatus())
                .members(memberDtos)
                .createdAt(group.getCreatedAt())
                .build();
    }
}
