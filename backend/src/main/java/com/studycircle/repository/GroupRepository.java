package com.studycircle.repository;

import com.studycircle.entity.StudyGroup;
import com.studycircle.entity.enums.GroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<StudyGroup, Long> {

    @Query("SELECT g FROM StudyGroup g WHERE " +
           "(:subjectId IS NULL OR g.subject.id = :subjectId) AND " +
           "(:status IS NULL OR g.status = :status) AND " +
           "(:startAfter IS NULL OR g.startTime >= :startAfter) AND " +
           "(:startBefore IS NULL OR g.startTime <= :startBefore) " +
           "ORDER BY g.startTime ASC")
    List<StudyGroup> findGroupsByFilters(
            @Param("subjectId") Long subjectId,
            @Param("status") GroupStatus status,
            @Param("startAfter") LocalDateTime startAfter,
            @Param("startBefore") LocalDateTime startBefore
    );

    List<StudyGroup> findByCreatorId(Long creatorId);
}
