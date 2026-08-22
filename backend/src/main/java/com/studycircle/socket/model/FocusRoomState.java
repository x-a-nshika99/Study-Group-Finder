package com.studycircle.socket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FocusRoomState implements Serializable {
    private Long groupId;
    private String phase; // "FOCUS", "BREAK"
    private String status; // "SCHEDULED", "ACTIVE", "PAUSED", "COMPLETED"
    private long phaseStartTime;
    private long phaseEndTime;
    private long remainingDurationMs;
    private int durationMinutes;
    private int breakDurationMinutes;
    private Long hostUserId;

    @Builder.Default
    private List<ParticipantInfo> activeParticipants = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo implements Serializable {
        private Long userId;
        private String name;
        private String profileImageUrl;
        private boolean isHost;
    }
}
