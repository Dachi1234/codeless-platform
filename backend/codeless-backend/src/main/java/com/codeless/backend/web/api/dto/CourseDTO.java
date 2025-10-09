package com.codeless.backend.web.api.dto;

import com.codeless.backend.domain.Course;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CourseDTO(
        Long id,
        String title,
        String slug,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        String imageUrl,
        String kind,
        String level,
        String instructorName,
        String instructorTitle,
        String instructorAvatarUrl,
        BigDecimal rating,
        Integer reviewCount,
        Integer lessonCount,
        Integer durationHours,
        LocalDate startDate,
        LocalDate endDate,
        Integer sessionCount,
        Integer maxStudents,
        Integer enrolledCount,
        Boolean featured,
        String category,
        String tags
) {
    public static CourseDTO from(Course c) {
        return new CourseDTO(
                c.getId(),
                c.getTitle(),
                c.getSlug(),
                c.getDescription(),
                c.getPrice(),
                c.getOriginalPrice(),
                c.getImageUrl(),
                c.getKind() != null ? c.getKind().name() : null,
                c.getLevel() != null ? c.getLevel().name() : null,
                c.getInstructorName(),
                c.getInstructorTitle(),
                c.getInstructorAvatarUrl(),
                c.getRating(),
                c.getReviewCount(),
                c.getLessonCount(),
                c.getDurationHours(),
                c.getStartDate(),
                c.getEndDate(),
                c.getSessionCount(),
                c.getMaxStudents(),
                c.getEnrolledCount(),
                c.getFeatured(),
                c.getCategory(),
                c.getTags()
        );
    }
}


