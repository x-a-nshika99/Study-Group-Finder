package com.studycircle.repository;

import com.studycircle.entity.RoomMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomMessageRepository extends JpaRepository<RoomMessage, Long> {
    List<RoomMessage> findByGroupIdOrderByCreatedAtAsc(Long groupId);
}
