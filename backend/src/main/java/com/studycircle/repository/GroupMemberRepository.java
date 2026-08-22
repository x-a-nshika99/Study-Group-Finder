package com.studycircle.repository;

import com.studycircle.entity.GroupMember;
import com.studycircle.entity.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupIdAndStatus(Long groupId, MemberStatus status);
    List<GroupMember> findByGroupId(Long groupId);
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
    boolean existsByGroupIdAndUserIdAndStatus(Long groupId, Long userId, MemberStatus status);
    long countByGroupIdAndStatus(Long groupId, MemberStatus status);
    List<GroupMember> findByUserIdAndStatus(Long userId, MemberStatus status);
}
