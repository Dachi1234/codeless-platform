package com.codeless.backend.repository;

import com.codeless.backend.domain.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    
    @Query("SELECT q FROM QuizQuestion q LEFT JOIN FETCH q.answerOptions WHERE q.id = :id")
    Optional<QuizQuestion> findByIdWithOptions(@Param("id") Long id);
    
    @Query("SELECT q FROM QuizQuestion q WHERE q.quiz.id = :quizId ORDER BY q.questionOrder")
    List<QuizQuestion> findByQuizIdOrderByQuestionOrder(@Param("quizId") Long quizId);
    
    @Query("SELECT MAX(q.questionOrder) FROM QuizQuestion q WHERE q.quiz.id = :quizId")
    Optional<Integer> findMaxQuestionOrderByQuizId(@Param("quizId") Long quizId);
}

