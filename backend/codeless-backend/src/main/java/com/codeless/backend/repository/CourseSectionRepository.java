package com.codeless.backend.repository;

import com.codeless.backend.domain.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseSectionRepository extends JpaRepository<CourseSection, Long> {
    
    @Query("SELECT s FROM CourseSection s LEFT JOIN FETCH s.lessons WHERE s.course.id = :courseId ORDER BY s.sectionOrder ASC")
    List<CourseSection> findByCourseIdWithLessons(@Param("courseId") Long courseId);
    
    @Query("SELECT MAX(s.sectionOrder) FROM CourseSection s WHERE s.course.id = :courseId")
    Optional<Integer> findMaxSectionOrderByCourseId(@Param("courseId") Long courseId);
}

