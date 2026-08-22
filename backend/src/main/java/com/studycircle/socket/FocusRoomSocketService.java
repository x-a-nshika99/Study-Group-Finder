package com.studycircle.socket;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.studycircle.entity.StudyGroup;
import com.studycircle.entity.User;
import com.studycircle.entity.enums.GroupStatus;
import com.studycircle.repository.GroupRepository;
import com.studycircle.repository.UserRepository;
import com.studycircle.service.RoomMessageService;
import com.studycircle.socket.model.FocusRoomState;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class FocusRoomSocketService {

    private final SocketIOServer socketIOServer;
    private final FocusRoomStateManager stateManager;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final RoomMessageService roomMessageService;

    // Track socketId -> user/group mapping
    private final Map<String, SocketSessionMeta> socketSessions = new ConcurrentHashMap<>();

    @Data
    public static class JoinRoomPayload {
        private Long groupId;
        private Long userId;
    }

    @Data
    public static class ControlEventPayload {
        private Long groupId;
        private Long userId;
    }

    @Data
    public static class SendMessagePayload {
        private Long groupId;
        private Long userId;
        private String message;
    }

    @Data
    public static class SocketSessionMeta {
        private Long groupId;
        private Long userId;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void startSocketIOServer() {
        try {
            socketIOServer.start();
            log.info("Netty Socket.IO Server started successfully on port {}", socketIOServer.getConfiguration().getPort());
        } catch (Exception e) {
            log.error("Failed to start Netty Socket.IO Server: {}", e.getMessage());
        }
    }

    @OnConnect
    public void onConnect(SocketIOClient client) {
        log.info("Socket client connected: {}", client.getSessionId());
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        String sessionId = client.getSessionId().toString();
        SocketSessionMeta meta = socketSessions.remove(sessionId);
        if (meta != null && meta.getGroupId() != null && meta.getUserId() != null) {
            handleUserLeaveRoom(client, meta.getGroupId(), meta.getUserId());
        }
        log.info("Socket client disconnected: {}", sessionId);
    }

    @OnEvent("JOIN_ROOM")
    public void onJoinRoom(SocketIOClient client, JoinRoomPayload payload) {
        if (payload == null || payload.getGroupId() == null || payload.getUserId() == null) {
            return;
        }

        Long groupId = payload.getGroupId();
        Long userId = payload.getUserId();
        String roomName = "group:" + groupId;

        client.joinRoom(roomName);

        SocketSessionMeta meta = new SocketSessionMeta();
        meta.setGroupId(groupId);
        meta.setUserId(userId);
        socketSessions.put(client.getSessionId().toString(), meta);

        Optional<StudyGroup> groupOpt = groupRepository.findById(groupId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (groupOpt.isEmpty() || userOpt.isEmpty()) {
            client.sendEvent("ERROR", "Invalid group or user");
            return;
        }

        StudyGroup group = groupOpt.get();
        User user = userOpt.get();

        FocusRoomState state = stateManager.getRoomState(groupId);
        if (state == null) {
            state = FocusRoomState.builder()
                    .groupId(groupId)
                    .phase("FOCUS")
                    .status(group.getStatus().name())
                    .durationMinutes(group.getDurationMinutes())
                    .breakDurationMinutes(group.getBreakDurationMinutes())
                    .hostUserId(group.getCreator().getId())
                    .activeParticipants(new ArrayList<>())
                    .build();
        }

        // Add to active participants if not present
        boolean exists = state.getActiveParticipants().stream().anyMatch(p -> p.getUserId().equals(userId));
        if (!exists) {
            FocusRoomState.ParticipantInfo participant = FocusRoomState.ParticipantInfo.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .profileImageUrl(user.getProfileImageUrl())
                    .isHost(user.getId().equals(group.getCreator().getId()))
                    .build();
            state.getActiveParticipants().add(participant);
        }

        stateManager.saveRoomState(state);

        // Immediate state sync to joined socket
        client.sendEvent("ROOM_STATE_SYNC", state);

        // Broadcast to everyone in room
        socketIOServer.getRoomOperations(roomName).sendEvent("PARTICIPANT_JOINED", state.getActiveParticipants());
    }

    @OnEvent("START_FOCUS")
    public void onStartFocus(SocketIOClient client, ControlEventPayload payload) {
        if (!validateHost(client, payload)) return;

        FocusRoomState state = stateManager.getRoomState(payload.getGroupId());
        if (state == null) return;

        long now = System.currentTimeMillis();
        long durationMs = state.getDurationMinutes() * 60 * 1000L;

        state.setPhase("FOCUS");
        state.setStatus("ACTIVE");
        state.setPhaseStartTime(now);
        state.setPhaseEndTime(now + durationMs);
        state.setRemainingDurationMs(durationMs);

        stateManager.saveRoomState(state);
        updateGroupStatus(payload.getGroupId(), GroupStatus.ACTIVE);

        socketIOServer.getRoomOperations("group:" + payload.getGroupId()).sendEvent("FOCUS_STARTED", state);
    }

    @OnEvent("START_BREAK")
    public void onStartBreak(SocketIOClient client, ControlEventPayload payload) {
        if (!validateHost(client, payload)) return;

        FocusRoomState state = stateManager.getRoomState(payload.getGroupId());
        if (state == null) return;

        long now = System.currentTimeMillis();
        long breakMs = state.getBreakDurationMinutes() * 60 * 1000L;

        state.setPhase("BREAK");
        state.setStatus("ACTIVE");
        state.setPhaseStartTime(now);
        state.setPhaseEndTime(now + breakMs);
        state.setRemainingDurationMs(breakMs);

        stateManager.saveRoomState(state);

        socketIOServer.getRoomOperations("group:" + payload.getGroupId()).sendEvent("BREAK_STARTED", state);
    }

    @OnEvent("PAUSE_SESSION")
    public void onPauseSession(SocketIOClient client, ControlEventPayload payload) {
        if (!validateHost(client, payload)) return;

        FocusRoomState state = stateManager.getRoomState(payload.getGroupId());
        if (state == null) return;

        long now = System.currentTimeMillis();
        long remaining = Math.max(0, state.getPhaseEndTime() - now);

        state.setStatus("PAUSED");
        state.setRemainingDurationMs(remaining);

        stateManager.saveRoomState(state);

        socketIOServer.getRoomOperations("group:" + payload.getGroupId()).sendEvent("SESSION_PAUSED", state);
    }

    @OnEvent("RESUME_SESSION")
    public void onResumeSession(SocketIOClient client, ControlEventPayload payload) {
        if (!validateHost(client, payload)) return;

        FocusRoomState state = stateManager.getRoomState(payload.getGroupId());
        if (state == null) return;

        long now = System.currentTimeMillis();
        long newEndTime = now + state.getRemainingDurationMs();

        state.setStatus("ACTIVE");
        state.setPhaseStartTime(now);
        state.setPhaseEndTime(newEndTime);

        stateManager.saveRoomState(state);

        socketIOServer.getRoomOperations("group:" + payload.getGroupId()).sendEvent("SESSION_RESUMED", state);
    }

    @OnEvent("COMPLETE_SESSION")
    public void onCompleteSession(SocketIOClient client, ControlEventPayload payload) {
        if (!validateHost(client, payload)) return;

        FocusRoomState state = stateManager.getRoomState(payload.getGroupId());
        if (state == null) return;

        state.setStatus("COMPLETED");
        stateManager.saveRoomState(state);

        updateGroupStatus(payload.getGroupId(), GroupStatus.COMPLETED);

        socketIOServer.getRoomOperations("group:" + payload.getGroupId()).sendEvent("SESSION_COMPLETED", state);
    }

    @OnEvent("SEND_MESSAGE")
    public void onSendMessage(SocketIOClient client, SendMessagePayload payload) {
        if (payload == null || payload.getGroupId() == null || payload.getUserId() == null || payload.getMessage() == null) {
            return;
        }

        try {
            RoomMessageService.RoomMessageDto messageDto = roomMessageService.sendMessage(
                    payload.getUserId(), payload.getGroupId(), payload.getMessage()
            );

            socketIOServer.getRoomOperations("group:" + payload.getGroupId())
                    .sendEvent("ROOM_MESSAGE_RECEIVED", messageDto);
        } catch (Exception e) {
            client.sendEvent("MESSAGE_ERROR", e.getMessage());
        }
    }

    private boolean validateHost(SocketIOClient client, ControlEventPayload payload) {
        if (payload == null || payload.getGroupId() == null || payload.getUserId() == null) {
            client.sendEvent("ERROR", "Invalid control payload");
            return false;
        }

        FocusRoomState state = stateManager.getRoomState(payload.getGroupId());
        if (state == null) {
            client.sendEvent("ERROR", "Room state not found");
            return false;
        }

        if (!payload.getUserId().equals(state.getHostUserId())) {
            client.sendEvent("ERROR", "Only the host can issue control commands");
            return false;
        }

        return true;
    }

    private void handleUserLeaveRoom(SocketIOClient client, Long groupId, Long userId) {
        FocusRoomState state = stateManager.getRoomState(groupId);
        if (state != null && state.getActiveParticipants() != null) {
            state.getActiveParticipants().removeIf(p -> p.getUserId().equals(userId));
            stateManager.saveRoomState(state);

            String roomName = "group:" + groupId;
            socketIOServer.getRoomOperations(roomName).sendEvent("PARTICIPANT_LEFT", state.getActiveParticipants());
        }
    }

    private void updateGroupStatus(Long groupId, GroupStatus status) {
        groupRepository.findById(groupId).ifPresent(group -> {
            group.setStatus(status);
            groupRepository.save(group);
        });
    }
}
