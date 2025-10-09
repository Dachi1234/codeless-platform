package com.codeless.backend.repository;

import com.codeless.backend.domain.QuizUserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizUserAnswerRepository extends JpaRepository<QuizUserAnswer, Long> {
    
    @Query("SELECT a FROM QuizUserAnswer a WHERE a.attempt.id = :attemptId")
    List<QuizUserAnswer> findByAttemptId(@Param("attemptId") Long attemptId);
}

