package com.codeless.backend.repository;

import com.codeless.backend.domain.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    
    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    
    @Query("SELECT lp FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.section.course.id = :courseId")
    List<LessonProgress> findByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);
    
    @Query("SELECT lp FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.id IN :lessonIds")
    List<LessonProgress> findByUserIdAndLessonIdIn(@Param("userId") Long userId, @Param("lessonIds") List<Long> lessonIds);
    
    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);
    
    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.section.course.id = :courseId AND lp.completed = true")
    Long countCompletedLessonsByUserAndCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);
    
    @Query("SELECT SUM(lp.timeSpentSeconds) FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.section.course.id = :courseId")
    Long sumTimeSpentByUserAndCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);
}

