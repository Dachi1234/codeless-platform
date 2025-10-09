package com.codeless.backend.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_questions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"quiz_id", "question_order"})
})
@Data
public class QuizQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String explanation; // Shown after answer

    private Integer points = 1;

    @Column(name = "question_order", nullable = false)
    private Integer questionOrder;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("optionOrder ASC")
    private List<QuizAnswerOption> answerOptions = new ArrayList<>();

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    public enum QuestionType {
        MULTIPLE_CHOICE,
        TRUE_FALSE,
        FILL_BLANK,
        SHORT_ANSWER
    }
}

