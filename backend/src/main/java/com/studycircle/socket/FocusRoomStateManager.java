package com.studycircle.socket;

import com.studycircle.socket.model.FocusRoomState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class FocusRoomStateManager {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ConcurrentHashMap<Long, FocusRoomState> inMemoryStore = new ConcurrentHashMap<>();

    private String getRedisKey(Long groupId) {
        return "group:" + groupId + ":state";
    }

    public FocusRoomState getRoomState(Long groupId) {
        try {
            Object obj = redisTemplate.opsForValue().get(getRedisKey(groupId));
            if (obj instanceof FocusRoomState) {
                return (FocusRoomState) obj;
            }
        } catch (Exception e) {
            log.warn("Redis unavailable, using in-memory room state for group {}: {}", groupId, e.getMessage());
        }
        return inMemoryStore.get(groupId);
    }

    public void saveRoomState(FocusRoomState state) {
        if (state == null || state.getGroupId() == null) return;

        inMemoryStore.put(state.getGroupId(), state);
        try {
            redisTemplate.opsForValue().set(getRedisKey(state.getGroupId()), state);
        } catch (Exception e) {
            log.warn("Failed to persist room state to Redis for group {}: {}", state.getGroupId(), e.getMessage());
        }
    }

    public void removeRoomState(Long groupId) {
        inMemoryStore.remove(groupId);
        try {
            redisTemplate.delete(getRedisKey(groupId));
        } catch (Exception e) {
            log.warn("Failed to delete room state from Redis for group {}: {}", groupId, e.getMessage());
        }
    }
}
