package com.studycircle.repository;

import com.studycircle.entity.StudySession;
import com.studycircle.entity.enums.StudySessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByUserIdOrderByStartTimeDesc(Long userId);
    Optional<StudySession> findByUserIdAndStatus(Long userId, StudySessionStatus status);
    
    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.startTime >= :since ORDER BY s.startTime DESC")
    List<StudySession> findByUserIdAndStartTimeAfter(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.startTime >= :startOfDay AND s.startTime <= :endOfDay")
    List<StudySession> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
}
