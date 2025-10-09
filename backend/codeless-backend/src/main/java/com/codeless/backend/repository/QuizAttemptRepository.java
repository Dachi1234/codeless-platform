package com.codeless.backend.repository;

import com.codeless.backend.domain.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    @Query("SELECT a FROM QuizAttempt a LEFT JOIN FETCH a.userAnswers WHERE a.id = :id")
    Optional<QuizAttempt> findByIdWithAnswers(@Param("id") Long id);
    
    @Query("SELECT a FROM QuizAttempt a WHERE a.user.id = :userId AND a.quiz.id = :quizId ORDER BY a.startedAt DESC")
    List<QuizAttempt> findByUserIdAndQuizId(@Param("userId") Long userId, @Param("quizId") Long quizId);
    
    @Query("SELECT COUNT(a) FROM QuizAttempt a WHERE a.user.id = :userId AND a.quiz.id = :quizId")
    Long countByUserIdAndQuizId(@Param("userId") Long userId, @Param("quizId") Long quizId);
    
    @Query("SELECT a FROM QuizAttempt a WHERE a.user.id = :userId AND a.quiz.id = :quizId AND a.passed = true")
    List<QuizAttempt> findPassedAttemptsByUserIdAndQuizId(@Param("userId") Long userId, @Param("quizId") Long quizId);
}

