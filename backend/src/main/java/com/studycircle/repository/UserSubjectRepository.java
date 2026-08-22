package com.studycircle.repository;

import com.studycircle.entity.UserSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubjectRepository extends JpaRepository<UserSubject, Long> {
    List<UserSubject> findByUserId(Long userId);
    Optional<UserSubject> findByUserIdAndSubjectId(Long userId, Long subjectId);
    void deleteByUserId(Long userId);
    boolean existsByUserIdAndSubjectId(Long userId, Long subjectId);
}
