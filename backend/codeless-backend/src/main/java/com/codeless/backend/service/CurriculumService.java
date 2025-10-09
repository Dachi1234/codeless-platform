package com.codeless.backend.service;

import com.codeless.backend.domain.CourseSection;
import com.codeless.backend.domain.CourseProgress;
import com.codeless.backend.domain.Enrollment;
import com.codeless.backend.domain.Lesson;
import com.codeless.backend.domain.LessonProgress;
import com.codeless.backend.domain.User;
import com.codeless.backend.repository.CourseSectionRepository;
import com.codeless.backend.repository.CourseProgressRepository;
import com.codeless.backend.repository.EnrollmentRepository;
import com.codeless.backend.repository.LessonProgressRepository;
import com.codeless.backend.repository.LessonRepository;
import com.codeless.backend.repository.UserRepository;
import com.codeless.backend.web.api.dto.CurriculumDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CurriculumService {
    
    private final CourseSectionRepository courseSectionRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseProgressRepository courseProgressRepository;
    
    @Transactional(readOnly = true)
    public CurriculumDTO.CurriculumResponse getCurriculum(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Fetch sections with lessons
        List<CourseSection> sections = courseSectionRepository.findByCourseIdWithLessons(courseId);
        
        // Fetch user's progress for this course
        List<LessonProgress> progressList = lessonProgressRepository.findByUserIdAndCourseId(user.getId(), courseId);
        Map<Long, LessonProgress> progressMap = progressList.stream()
                .collect(Collectors.toMap(lp -> lp.getLesson().getId(), lp -> lp));
        
        // Map to DTOs
        List<CurriculumDTO.SectionDTO> sectionDTOs = sections.stream()
                .map(section -> CurriculumDTO.SectionDTO.from(section, progressMap))
                .collect(Collectors.toList());
        
        return new CurriculumDTO.CurriculumResponse(sectionDTOs);
    }
    
    @Transactional
    public CurriculumDTO.LessonCompleteResponse markLessonComplete(
            Long lessonId, 
            String userEmail, 
            CurriculumDTO.LessonCompleteRequest request) {
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
        
        // Find or create progress record
        LessonProgress progress = lessonProgressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseGet(() -> {
                    LessonProgress newProgress = new LessonProgress();
                    newProgress.setUser(user);
                    newProgress.setLesson(lesson);
                    return newProgress;
                });
        
        // Update progress
        progress.setCompleted(true);
        progress.setCompletedAt(OffsetDateTime.now());
        
        if (request.positionSeconds() != null) {
            progress.setLastPositionSeconds(request.positionSeconds());
        }
        
        if (request.timeSpentSeconds() != null) {
            progress.setTimeSpentSeconds(
                    (progress.getTimeSpentSeconds() != null ? progress.getTimeSpentSeconds() : 0) + 
                    request.timeSpentSeconds()
            );
        }
        
        lessonProgressRepository.save(progress);
        
        // Update course-level progress
        updateCourseProgress(user.getId(), lesson.getSection().getCourse().getId());
        
        return new CurriculumDTO.LessonCompleteResponse(
                lessonId,
                true,
                "Lesson marked as complete"
        );
    }
    
    private void updateCourseProgress(Long userId, Long courseId) {
        // Find the enrollment
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        
        // Count total lessons in the course
        Integer totalLessons = courseProgressRepository.countActualLessonsInCourse(courseId);
        
        // Count completed lessons for this user
        Long completedLessons = lessonProgressRepository.countCompletedLessonsByUserAndCourse(userId, courseId);
        
        // Calculate completion percentage
        int completionPercentage = totalLessons > 0 ? (int) ((completedLessons * 100) / totalLessons) : 0;
        
        // Sum time spent
        Long totalTimeSpent = lessonProgressRepository.sumTimeSpentByUserAndCourse(userId, courseId);
        
        // Find or create course progress
        CourseProgress courseProgress = courseProgressRepository.findByEnrollmentId(enrollment.getId())
                .orElseGet(() -> {
                    CourseProgress newProgress = new CourseProgress();
                    newProgress.setEnrollment(enrollment);
                    return newProgress;
                });
        
        // Update progress
        courseProgress.setLessonCompleted(completedLessons.intValue());
        courseProgress.setLessonTotal(totalLessons);
        courseProgress.setTimeSpentSeconds(totalTimeSpent != null ? totalTimeSpent : 0L);
        courseProgress.setCompletionPercentage(completionPercentage);
        courseProgress.setLastAccessedAt(OffsetDateTime.now());
        courseProgress.setUpdatedAt(OffsetDateTime.now());
        
        courseProgressRepository.save(courseProgress);
    }
}

