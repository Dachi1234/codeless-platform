package com.codeless.backend.service;

import com.codeless.backend.domain.User;
import com.codeless.backend.domain.UserAchievement;
import com.codeless.backend.exception.ResourceNotFoundException;
import com.codeless.backend.repository.*;
import com.codeless.backend.web.api.dto.DashboardDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final LearningStreakRepository learningStreakRepository;
    private final UserAchievementRepository userAchievementRepository;

    public DashboardService(UserRepository userRepository, EnrollmentRepository enrollmentRepository,
                          CourseProgressRepository courseProgressRepository,
                          LearningStreakRepository learningStreakRepository,
                          UserAchievementRepository userAchievementRepository) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseProgressRepository = courseProgressRepository;
        this.learningStreakRepository = learningStreakRepository;
        this.userAchievementRepository = userAchievementRepository;
    }

    @Transactional(readOnly = true)
    public DashboardDTO.DashboardStatsDTO getStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));
        
        // Total enrolled courses
        int totalCourses = enrollmentRepository.findByUser(user).size();
        
        // Completed courses (100% completion)
        Long completed = courseProgressRepository.countCompletedByUserId(user.getId());
        int completedCourses = completed != null ? completed.intValue() : 0;
        
        // Total learning time in hours
        Long totalSeconds = courseProgressRepository.sumTimeSpentByUserId(user.getId());
        long learningTimeHours = totalSeconds != null ? totalSeconds / 3600 : 0;
        
        // Current streak
        int currentStreak = learningStreakRepository.findByUserId(user.getId())
                .map(streak -> streak.getCurrentStreakDays())
                .orElse(0);
        
        return new DashboardDTO.DashboardStatsDTO(
                totalCourses,
                completedCourses,
                learningTimeHours,
                currentStreak
        );
    }

    @Transactional(readOnly = true)
    public List<DashboardDTO.AchievementDTO> getAchievements(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));
        
        List<UserAchievement> userAchievements = userAchievementRepository
                .findByUserIdWithAchievement(user.getId());
        
        return userAchievements.stream()
                .map(DashboardDTO.AchievementDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DashboardDTO.CourseProgressDTO> getEnrolledCoursesWithProgress(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));
        
        return enrollmentRepository.findByUser(user).stream()
                .map(enrollment -> {
                    var progress = courseProgressRepository.findByEnrollmentId(enrollment.getId())
                            .orElseGet(() -> {
                                // No progress yet, calculate actual lesson count from curriculum
                                Long courseId = enrollment.getCourse().getId();
                                
                                // Count actual lessons in the course curriculum
                                Integer actualLessonCount = courseProgressRepository.countActualLessonsInCourse(courseId);
                                
                                var defaultProgress = new com.codeless.backend.domain.CourseProgress();
                                defaultProgress.setId(0L); // Temporary ID for non-persisted progress
                                defaultProgress.setEnrollment(enrollment);
                                defaultProgress.setLessonCompleted(0);
                                defaultProgress.setLessonTotal(actualLessonCount != null ? actualLessonCount : 0);
                                defaultProgress.setTimeSpentSeconds(0L);
                                defaultProgress.setCompletionPercentage(0);
                                defaultProgress.setLastAccessedAt(null);
                                return defaultProgress;
                            });
                    return DashboardDTO.CourseProgressDTO.from(enrollment, progress);
                })
                .toList();
    }
}

