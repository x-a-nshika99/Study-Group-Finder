package com.studycircle.service;

import com.studycircle.dto.StartSessionRequest;
import com.studycircle.dto.StopSessionRequest;
import com.studycircle.dto.StudySessionDto;
import com.studycircle.entity.StudyGroup;
import com.studycircle.entity.StudySession;
import com.studycircle.entity.Subject;
import com.studycircle.entity.User;
import com.studycircle.entity.enums.StudySessionStatus;
import com.studycircle.exception.ResourceNotFoundException;
import com.studycircle.repository.GroupRepository;
import com.studycircle.repository.StudySessionRepository;
import com.studycircle.repository.SubjectRepository;
import com.studycircle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final GroupRepository groupRepository;
    private final UserService userService;
    private final SubjectService subjectService;

    @Transactional
    public StudySessionDto startSession(Long userId, StartSessionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        StudyGroup group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId()).orElse(null);
        }

        // Auto-stop any existing active session for this user
        Optional<StudySession> activeSessionOpt = studySessionRepository.findByUserIdAndStatus(userId, StudySessionStatus.ACTIVE);
        activeSessionOpt.ifPresent(session -> {
            session.setEndTime(LocalDateTime.now());
            session.setStatus(StudySessionStatus.STOPPED);
            long minutes = Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
            session.setDurationMinutes((int) Math.max(1, minutes));
            studySessionRepository.save(session);
        });

        StudySession newSession = StudySession.builder()
                .user(user)
                .subject(subject)
                .group(group)
                .sessionType(request.getSessionType())
                .startTime(LocalDateTime.now())
                .status(StudySessionStatus.ACTIVE)
                .build();

        StudySession saved = studySessionRepository.save(newSession);
        return mapToDto(saved);
    }

    @Transactional
    public StudySessionDto stopSession(Long userId, Long sessionId, StopSessionRequest request) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        if (!session.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Session not found for user");
        }

        LocalDateTime now = LocalDateTime.now();
        session.setEndTime(now);
        session.setStatus(request.getStatus() != null ? request.getStatus() : StudySessionStatus.COMPLETED);

        long minutes = Duration.between(session.getStartTime(), now).toMinutes();
        session.setDurationMinutes((int) Math.max(1, minutes));

        StudySession saved = studySessionRepository.save(session);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<StudySessionDto> getUserSessions(Long userId) {
        return studySessionRepository.findByUserIdOrderByStartTimeDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudySessionDto mapToDto(StudySession session) {
        return StudySessionDto.builder()
                .id(session.getId())
                .user(userService.mapToUserDto(session.getUser()))
                .subject(subjectService.mapToDto(session.getSubject()))
                .groupId(session.getGroup() != null ? session.getGroup().getId() : null)
                .groupName(session.getGroup() != null ? session.getGroup().getName() : null)
                .sessionType(session.getSessionType())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .durationMinutes(session.getDurationMinutes())
                .status(session.getStatus())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
