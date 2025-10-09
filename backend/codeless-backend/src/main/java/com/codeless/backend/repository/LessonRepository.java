package com.codeless.backend.repository;

import com.codeless.backend.domain.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    
    @Query("SELECT MAX(l.lessonOrder) FROM Lesson l WHERE l.section.id = :sectionId")
    Optional<Integer> findMaxLessonOrderBySectionId(@Param("sectionId") Long sectionId);
}

