package com.codeless.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "course")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    public enum Kind {
        PRE_RECORDED,
        LIVE,
        BUNDLE
    }

    public enum Level {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        ALL_LEVELS
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 200, unique = true)
    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    // Pricing
    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice; // For showing discounts

    // Instructor information
    @Column(name = "instructor_name", length = 200)
    private String instructorName;

    @Column(name = "instructor_title", length = 200)
    private String instructorTitle;

    @Column(name = "instructor_avatar_url")
    private String instructorAvatarUrl;

    // Course metadata
    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Kind kind;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Level level;

    // Ratings
    @Column(precision = 3, scale = 2)
    private BigDecimal rating; // e.g., 4.85

    @Column(name = "review_count")
    private Integer reviewCount;

    // Course content
    @Column(name = "lesson_count")
    private Integer lessonCount;

    @Column(name = "duration_hours")
    private Integer durationHours; // Total course duration in hours

    // LIVE course specific fields
    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "session_count")
    private Integer sessionCount; // Number of live sessions

    @Column(name = "max_students")
    private Integer maxStudents; // Capacity for live courses

    @Column(name = "enrolled_count")
    private Integer enrolledCount; // Current enrollment count

    // Publishing
    @Column(nullable = false)
    private Boolean published = true;

    @Column(name = "featured")
    private Boolean featured = false;

    // Categories/Tags
    @Column(length = 100)
    private String category;

    @Column(columnDefinition = "text")
    private String tags; // Comma-separated tags

    // Timestamps
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Convenience methods for review system
    public BigDecimal getAverageRating() {
        return this.rating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.rating = averageRating;
    }
}


