package com.codeless.backend.web.api.dto;

import com.codeless.backend.domain.Achievement;
import com.codeless.backend.domain.CourseProgress;
import com.codeless.backend.domain.Enrollment;
import com.codeless.backend.domain.UserAchievement;

import java.time.OffsetDateTime;

public class DashboardDTO {
    
    public record DashboardStatsDTO(
            int totalCourses,
            int completedCourses,
            long learningTimeHours,
            int currentStreak
    ) {}
    
    public record CourseProgressDTO(
            Long id,
            Long enrollmentId,
            CourseDTO course,
            int lessonCompleted,
            int lessonTotal,
            long timeSpentSeconds,
            int completionPercentage,
            OffsetDateTime lastAccessedAt,
            OffsetDateTime enrolledAt
    ) {
        public static CourseProgressDTO from(Enrollment enrollment, CourseProgress progress) {
            return new CourseProgressDTO(
                    progress.getId(),
                    enrollment.getId(),
                    CourseDTO.from(enrollment.getCourse()),
                    progress.getLessonCompleted(),
                    progress.getLessonTotal(),
                    progress.getTimeSpentSeconds(),
                    progress.getCompletionPercentage(),
                    progress.getLastAccessedAt(),
                    enrollment.getEnrolledAt()
            );
        }
    }
    
    public record AchievementDTO(
            Long id,
            String code,
            String name,
            String description,
            String iconName,
            OffsetDateTime earnedAt
    ) {
        public static AchievementDTO from(UserAchievement userAchievement) {
            Achievement achievement = userAchievement.getAchievement();
            return new AchievementDTO(
                    achievement.getId(),
                    achievement.getCode(),
                    achievement.getName(),
                    achievement.getDescription(),
                    achievement.getIconName(),
                    userAchievement.getEarnedAt()
            );
        }
    }
}

