package com.codeless.backend.repository;

import com.codeless.backend.domain.QuizAnswerOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizAnswerOptionRepository extends JpaRepository<QuizAnswerOption, Long> {
    
    @Query("SELECT o FROM QuizAnswerOption o WHERE o.question.id = :questionId ORDER BY o.optionOrder")
    List<QuizAnswerOption> findByQuestionIdOrderByOptionOrder(@Param("questionId") Long questionId);
    
    @Query("SELECT MAX(o.optionOrder) FROM QuizAnswerOption o WHERE o.question.id = :questionId")
    Optional<Integer> findMaxOptionOrderByQuestionId(@Param("questionId") Long questionId);
}

