package com.studycircle.service;

import com.studycircle.dto.SubjectDto;
import com.studycircle.dto.UserDto;
import com.studycircle.dto.UserProfileRequest;
import com.studycircle.entity.Subject;
import com.studycircle.entity.User;
import com.studycircle.entity.UserSubject;
import com.studycircle.exception.ResourceNotFoundException;
import com.studycircle.repository.SubjectRepository;
import com.studycircle.repository.UserRepository;
import com.studycircle.repository.UserSubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final UserSubjectRepository userSubjectRepository;
    private final SubjectService subjectService;

    @Transactional(readOnly = true)
    public UserDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToUserDto(user);
    }

    @Transactional
    public UserDto updateUserProfile(Long userId, UserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }
        if (request.getDailyGoalMinutes() != null) {
            user.setDailyGoalMinutes(request.getDailyGoalMinutes());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        User updatedUser = userRepository.save(user);
        return mapToUserDto(updatedUser);
    }

    @Transactional
    public UserDto updateUserSubjects(Long userId, List<Long> subjectIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Clear existing user subjects
        userSubjectRepository.deleteByUserId(userId);

        // Add selected subjects
        if (subjectIds != null && !subjectIds.isEmpty()) {
            List<Subject> subjects = subjectRepository.findAllById(subjectIds);
            List<UserSubject> userSubjects = subjects.stream()
                    .map(subject -> UserSubject.builder()
                            .user(user)
                            .subject(subject)
                            .build())
                    .collect(Collectors.toList());
            userSubjectRepository.saveAll(userSubjects);
        }

        return mapToUserDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto mapToUserDto(User user) {
        List<SubjectDto> subjects = userSubjectRepository.findByUserId(user.getId()).stream()
                .map(us -> subjectService.mapToDto(us.getSubject()))
                .collect(Collectors.toList());

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .dailyGoalMinutes(user.getDailyGoalMinutes())
                .bio(user.getBio())
                .subjects(subjects)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
