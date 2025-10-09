package com.codeless.backend.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "quiz_user_answers")
@Data
public class QuizUserAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuizAnswerOption selectedOption;

    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer; // For short answer/fill blank

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "points_earned")
    private Integer pointsEarned = 0;
}

