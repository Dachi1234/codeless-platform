package com.codeless.backend.web.api.dto;

import com.codeless.backend.domain.Enrollment;

import java.time.OffsetDateTime;

public record EnrollmentDTO(
    Long id,
    Long userId,
    Long courseId,
    OffsetDateTime enrolledAt,
    CourseDTO course
) {
    public static EnrollmentDTO from(Enrollment enrollment) {
        return new EnrollmentDTO(
            enrollment.getId(),
            enrollment.getUser().getId(),
            enrollment.getCourse().getId(),
            enrollment.getEnrolledAt(),
            CourseDTO.from(enrollment.getCourse())
        );
    }
}

