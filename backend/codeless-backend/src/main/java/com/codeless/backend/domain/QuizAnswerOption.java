package com.codeless.backend.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "quiz_answer_options", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"question_id", "option_order"})
})
@Data
public class QuizAnswerOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @Column(name = "option_text", columnDefinition = "TEXT", nullable = false)
    private String optionText;

    @Column(name = "is_correct")
    private Boolean isCorrect = false;

    @Column(name = "option_order", nullable = false)
    private Integer optionOrder;

    // For FILL_BLANK questions: comma-separated acceptable answers
    // Example: "Paris,paris,PARIS" - case variations accepted
    @Column(name = "acceptable_answers", columnDefinition = "TEXT")
    private String acceptableAnswers;
}

