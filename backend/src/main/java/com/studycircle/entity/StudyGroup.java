package com.studycircle.entity;

import com.studycircle.entity.enums.GroupSessionType;
import com.studycircle.entity.enums.GroupStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type")
    @Builder.Default
    private GroupSessionType sessionType = GroupSessionType.POMODORO;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "break_duration_minutes", nullable = false)
    @Builder.Default
    private Integer breakDurationMinutes = 5;

    @Column(name = "max_members", nullable = false)
    @Builder.Default
    private Integer maxMembers = 8;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GroupStatus status = GroupStatus.SCHEDULED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
