package com.codeless.backend.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

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
    private QuizAnswerOption selectedOption; // For TRUE_FALSE (single selection)

    // For MULTIPLE_CHOICE: store comma-separated IDs
    // Example: "1,3,5" for options 1, 3, and 5
    @Column(name = "selected_option_ids", columnDefinition = "TEXT")
    private String selectedOptionIds;

    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer; // For FILL_BLANK

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "points_earned")
    private Integer pointsEarned = 0;

    // Helper methods for multiple choice
    public List<Long> getSelectedOptionIdsList() {
        if (selectedOptionIds == null || selectedOptionIds.trim().isEmpty()) {
            return new ArrayList<>();
        }
        List<Long> ids = new ArrayList<>();
        for (String id : selectedOptionIds.split(",")) {
            ids.add(Long.parseLong(id.trim()));
        }
        return ids;
    }

    public void setSelectedOptionIdsList(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            this.selectedOptionIds = null;
        } else {
            this.selectedOptionIds = String.join(",", ids.stream().map(String::valueOf).toArray(String[]::new));
        }
    }
}

