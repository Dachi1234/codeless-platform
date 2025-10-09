package com.codeless.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "course_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", unique = true)
    private Enrollment enrollment;

    @Column(name = "lesson_completed", nullable = false)
    private Integer lessonCompleted = 0;

    @Column(name = "lesson_total", nullable = false)
    private Integer lessonTotal = 0;

    @Column(name = "time_spent_seconds", nullable = false)
    private Long timeSpentSeconds = 0L;

    @Column(name = "last_accessed_at")
    private OffsetDateTime lastAccessedAt;

    @Column(name = "completion_percentage", nullable = false)
    private Integer completionPercentage = 0;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}

