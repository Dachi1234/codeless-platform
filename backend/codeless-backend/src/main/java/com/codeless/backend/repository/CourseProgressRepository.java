package com.codeless.backend.repository;

import com.codeless.backend.domain.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {
    Optional<CourseProgress> findByEnrollmentId(Long enrollmentId);
    
    @Query("SELECT cp FROM CourseProgress cp JOIN FETCH cp.enrollment e WHERE e.user.id = :userId")
    List<CourseProgress> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(cp.timeSpentSeconds) FROM CourseProgress cp JOIN cp.enrollment e WHERE e.user.id = :userId")
    Long sumTimeSpentByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(cp) FROM CourseProgress cp JOIN cp.enrollment e WHERE e.user.id = :userId AND cp.completionPercentage = 100")
    Long countCompletedByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(l) FROM Lesson l JOIN l.section s WHERE s.course.id = :courseId")
    Integer countActualLessonsInCourse(@Param("courseId") Long courseId);
}

