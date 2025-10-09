package com.codeless.backend.repository;

import com.codeless.backend.domain.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :id")
    Optional<Quiz> findByIdWithQuestions(@Param("id") Long id);
    
    @Query("SELECT q FROM Quiz q WHERE q.lesson.id = :lessonId")
    Optional<Quiz> findByLessonId(@Param("lessonId") Long lessonId);
    
    boolean existsByLessonId(Long lessonId);
}

