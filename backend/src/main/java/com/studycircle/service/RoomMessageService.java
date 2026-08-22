package com.studycircle.service;

import com.studycircle.dto.UserDto;
import com.studycircle.entity.RoomMessage;
import com.studycircle.entity.StudyGroup;
import com.studycircle.entity.User;
import com.studycircle.entity.enums.MessageSentDuring;
import com.studycircle.exception.BadRequestException;
import com.studycircle.exception.ResourceNotFoundException;
import com.studycircle.repository.GroupRepository;
import com.studycircle.repository.RoomMessageRepository;
import com.studycircle.repository.UserRepository;
import com.studycircle.socket.FocusRoomStateManager;
import com.studycircle.socket.model.FocusRoomState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomMessageService {

    private final RoomMessageRepository roomMessageRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final FocusRoomStateManager roomStateManager;
    private final UserService userService;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomMessageDto {
        private Long id;
        private Long groupId;
        private UserDto user;
        private String message;
        private String sentDuring;
        private LocalDateTime createdAt;
    }

    @Transactional
    public RoomMessageDto sendMessage(Long userId, Long groupId, String messageText) {
        FocusRoomState roomState = roomStateManager.getRoomState(groupId);
        if (roomState == null || !"BREAK".equalsIgnoreCase(roomState.getPhase())) {
            throw new BadRequestException("Messages are strictly allowed ONLY during the BREAK phase.");
        }

        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RoomMessage roomMessage = RoomMessage.builder()
                .group(group)
                .user(user)
                .message(messageText)
                .sentDuring(MessageSentDuring.BREAK)
                .build();

        RoomMessage saved = roomMessageRepository.save(roomMessage);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<RoomMessageDto> getGroupMessages(Long groupId) {
        return roomMessageRepository.findByGroupIdOrderByCreatedAtAsc(groupId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private RoomMessageDto mapToDto(RoomMessage msg) {
        return RoomMessageDto.builder()
                .id(msg.getId())
                .groupId(msg.getGroup().getId())
                .user(userService.mapToUserDto(msg.getUser()))
                .message(msg.getMessage())
                .sentDuring(msg.getSentDuring().name())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
