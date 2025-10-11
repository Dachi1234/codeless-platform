package com.codeless.backend.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

/**
 * Represents a user review/rating for a course.
 * Only users who have purchased the course can leave a review.
 */
@Entity
@Table(
    name = "course_reviews",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_course_user_review",
        columnNames = {"course_id", "user_id"}
    )
)
@Data
public class CourseReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating; // 1-5 stars

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}

