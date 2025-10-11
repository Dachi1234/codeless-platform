package com.codeless.backend.web.api;

import com.codeless.backend.domain.*;
import com.codeless.backend.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizUserAnswerRepository quizUserAnswerRepository;
    private final QuizAnswerOptionRepository quizAnswerOptionRepository;
    private final UserRepository userRepository;

    // ==================== DTOs ====================

    @Data
    public static class QuizTakeDTO {
        private Long id;
        private String title;
        private String description;
        private Integer passingScore;
        private Integer timeLimitMinutes;
        private Boolean randomizeQuestions;
        private Integer maxAttempts;
        private Integer attemptCount;
        private Boolean canAttempt;
        private List<QuestionTakeDTO> questions;
    }

    @Data
    public static class QuestionTakeDTO {
        private Long id;
        private String questionType;
        private String questionText;
        private Integer points;
        private List<AnswerOptionTakeDTO> answerOptions;
    }

    @Data
    public static class AnswerOptionTakeDTO {
        private Long id;
        private String optionText;
        // Note: isCorrect is NOT included for student view
    }

    @Data
    public static class AttemptStartDTO {
        private Long attemptId;
        private OffsetDateTime startedAt;
        private Integer timeLimitMinutes;
    }

    @Data
    public static class SubmitAnswersDTO {
        private Long attemptId;
        private List<UserAnswerDTO> answers;
    }

    @Data
    public static class UserAnswerDTO {
        private Long questionId;
        private Long selectedOptionId; // For single choice (TRUE_FALSE)
        private List<Long> selectedOptionIds; // For multiple choice (MULTIPLE_CHOICE)
        private String textAnswer; // For fill blank
    }

    @Data
    public static class AttemptResultDTO {
        private Long attemptId;
        private BigDecimal score;
        private Boolean passed;
        private Integer timeSpentSeconds;
        private OffsetDateTime completedAt;
        private List<QuestionResultDTO> questionResults;
    }

    @Data
    public static class QuestionResultDTO {
        private Long questionId;
        private String questionText;
        private String questionType;
        private Boolean isCorrect;
        private Integer pointsEarned;
        private Integer pointsPossible;
        private String explanation;
        private Long selectedOptionId; // For TRUE_FALSE
        private List<Long> selectedOptionIds; // For MULTIPLE_CHOICE
        private String selectedOptionText;
        private List<String> correctOptionTexts; // All correct answers
        private String textAnswer;
        private String acceptableAnswers; // For FILL_BLANK display
    }

    @Data
    public static class AttemptHistoryDTO {
        private Long id;
        private BigDecimal score;
        private Boolean passed;
        private OffsetDateTime startedAt;
        private OffsetDateTime completedAt;
        private Integer timeSpentSeconds;
    }

    // ==================== Endpoints ====================

    @GetMapping("/{quizId}/take")
    @Transactional(readOnly = true)
    public ResponseEntity<QuizTakeDTO> getQuizForTaking(@PathVariable Long quizId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Quiz quiz = quizRepository.findByIdWithQuestions(quizId)
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        QuizTakeDTO dto = new QuizTakeDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setPassingScore(quiz.getPassingScore());
        dto.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
        dto.setRandomizeQuestions(quiz.getRandomizeQuestions());
        dto.setMaxAttempts(quiz.getMaxAttempts());

        // Check attempt count
        Long attemptCount = quizAttemptRepository.countByUserIdAndQuizId(user.getId(), quizId);
        dto.setAttemptCount(attemptCount.intValue());
        
        boolean canAttempt = quiz.getMaxAttempts() == null || attemptCount < quiz.getMaxAttempts();
        dto.setCanAttempt(canAttempt);

        // Load questions (without correct answers)
        List<QuestionTakeDTO> questions = quiz.getQuestions().stream()
            .map(q -> {
                QuestionTakeDTO qDto = new QuestionTakeDTO();
                qDto.setId(q.getId());
                qDto.setQuestionType(q.getQuestionType().name());
                qDto.setQuestionText(q.getQuestionText());
                qDto.setPoints(q.getPoints());

                // Load answer options (without isCorrect flag)
                List<AnswerOptionTakeDTO> options = q.getAnswerOptions().stream()
                    .map(opt -> {
                        AnswerOptionTakeDTO optDto = new AnswerOptionTakeDTO();
                        optDto.setId(opt.getId());
                        optDto.setOptionText(opt.getOptionText());
                        return optDto;
                    })
                    .collect(Collectors.toList());
                qDto.setAnswerOptions(options);

                return qDto;
            })
            .collect(Collectors.toList());

        dto.setQuestions(questions);

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{quizId}/start")
    @Transactional
    public ResponseEntity<AttemptStartDTO> startQuizAttempt(@PathVariable Long quizId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        // Check if user can attempt
        Long attemptCount = quizAttemptRepository.countByUserIdAndQuizId(user.getId(), quizId);
        if (quiz.getMaxAttempts() != null && attemptCount >= quiz.getMaxAttempts()) {
            throw new IllegalStateException("Maximum attempts reached");
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setStartedAt(OffsetDateTime.now());

        QuizAttempt saved = quizAttemptRepository.save(attempt);

        AttemptStartDTO dto = new AttemptStartDTO();
        dto.setAttemptId(saved.getId());
        dto.setStartedAt(saved.getStartedAt());
        dto.setTimeLimitMinutes(quiz.getTimeLimitMinutes());

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/submit")
    @Transactional
    public ResponseEntity<AttemptResultDTO> submitQuizAnswers(@RequestBody SubmitAnswersDTO dto, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        QuizAttempt attempt = quizAttemptRepository.findById(dto.getAttemptId())
            .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        if (attempt.getCompletedAt() != null) {
            throw new IllegalStateException("Quiz already submitted");
        }

        Quiz quiz = quizRepository.findByIdWithQuestions(attempt.getQuiz().getId())
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        // Save user answers and calculate score
        int totalPoints = 0;
        int earnedPoints = 0;

        List<QuizUserAnswer> userAnswers = new ArrayList<>();

        for (UserAnswerDTO answerDto : dto.getAnswers()) {
            QuizQuestion question = quiz.getQuestions().stream()
                .filter(q -> q.getId().equals(answerDto.getQuestionId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

            totalPoints += question.getPoints();

            QuizUserAnswer userAnswer = new QuizUserAnswer();
            userAnswer.setAttempt(attempt);
            userAnswer.setQuestion(question);

            boolean isCorrect = false;

            // Check answer based on question type
            if (question.getQuestionType() == QuizQuestion.QuestionType.TRUE_FALSE) {
                // TRUE_FALSE: Single selection, check if correct
                if (answerDto.getSelectedOptionId() != null) {
                    QuizAnswerOption selectedOption = quizAnswerOptionRepository.findById(answerDto.getSelectedOptionId())
                        .orElseThrow(() -> new IllegalArgumentException("Option not found"));
                    
                    userAnswer.setSelectedOption(selectedOption);
                    isCorrect = selectedOption.getIsCorrect();
                }
            } else if (question.getQuestionType() == QuizQuestion.QuestionType.MULTIPLE_CHOICE) {
                // MULTIPLE_CHOICE: Multiple selections, check if ALL are correct
                if (answerDto.getSelectedOptionIds() != null && !answerDto.getSelectedOptionIds().isEmpty()) {
                    // Get all correct option IDs for this question
                    List<Long> correctOptionIds = question.getAnswerOptions().stream()
                        .filter(QuizAnswerOption::getIsCorrect)
                        .map(QuizAnswerOption::getId)
                        .sorted()
                        .collect(Collectors.toList());
                    
                    // Sort user's selections for comparison
                    List<Long> userSelections = answerDto.getSelectedOptionIds().stream()
                        .sorted()
                        .collect(Collectors.toList());
                    
                    // Store selections
                    userAnswer.setSelectedOptionIdsList(userSelections);
                    
                    // Check if user selected exactly the correct answers (no more, no less)
                    isCorrect = correctOptionIds.equals(userSelections);
                }
            } else if (question.getQuestionType() == QuizQuestion.QuestionType.FILL_BLANK) {
                // FILL_BLANK: Check against acceptable answers
                if (answerDto.getTextAnswer() != null && !answerDto.getTextAnswer().trim().isEmpty()) {
                    userAnswer.setTextAnswer(answerDto.getTextAnswer());
                    
                    // Get acceptable answers from the first answer option
                    // (For FILL_BLANK, we store acceptable answers in option 0)
                    if (!question.getAnswerOptions().isEmpty()) {
                        QuizAnswerOption fillBlankOption = question.getAnswerOptions().get(0);
                        String acceptableAnswers = fillBlankOption.getAcceptableAnswers();
                        
                        if (acceptableAnswers != null && !acceptableAnswers.trim().isEmpty()) {
                            String userAnswerLower = answerDto.getTextAnswer().trim().toLowerCase();
                            
                            // Check if user answer matches any acceptable answer (case-insensitive)
                            for (String acceptable : acceptableAnswers.split(",")) {
                                if (acceptable.trim().toLowerCase().equals(userAnswerLower)) {
                                    isCorrect = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            userAnswer.setIsCorrect(isCorrect);
            userAnswer.setPointsEarned(isCorrect ? question.getPoints() : 0);

            if (isCorrect) {
                earnedPoints += question.getPoints();
            }

            userAnswers.add(userAnswer);
            quizUserAnswerRepository.save(userAnswer);
        }

        // Calculate percentage score
        BigDecimal score = totalPoints > 0 
            ? BigDecimal.valueOf(earnedPoints).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalPoints), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        boolean passed = score.compareTo(BigDecimal.valueOf(quiz.getPassingScore())) >= 0;

        // Update attempt
        attempt.setCompletedAt(OffsetDateTime.now());
        attempt.setScore(score);
        attempt.setPassed(passed);

        Duration duration = Duration.between(attempt.getStartedAt(), attempt.getCompletedAt());
        attempt.setTimeSpentSeconds((int) duration.getSeconds());

        quizAttemptRepository.save(attempt);

        // Build result DTO
        AttemptResultDTO result = buildAttemptResult(attempt, quiz, userAnswers);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/attempts/{attemptId}/result")
    @Transactional(readOnly = true)
    public ResponseEntity<AttemptResultDTO> getAttemptResult(@PathVariable Long attemptId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        QuizAttempt attempt = quizAttemptRepository.findByIdWithAnswers(attemptId)
            .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        Quiz quiz = quizRepository.findByIdWithQuestions(attempt.getQuiz().getId())
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        AttemptResultDTO result = buildAttemptResult(attempt, quiz, attempt.getUserAnswers());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{quizId}/attempts")
    @Transactional(readOnly = true)
    public ResponseEntity<List<AttemptHistoryDTO>> getAttemptHistory(@PathVariable Long quizId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndQuizId(user.getId(), quizId);

        List<AttemptHistoryDTO> history = attempts.stream()
            .map(attempt -> {
                AttemptHistoryDTO dto = new AttemptHistoryDTO();
                dto.setId(attempt.getId());
                dto.setScore(attempt.getScore());
                dto.setPassed(attempt.getPassed());
                dto.setStartedAt(attempt.getStartedAt());
                dto.setCompletedAt(attempt.getCompletedAt());
                dto.setTimeSpentSeconds(attempt.getTimeSpentSeconds());
                return dto;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }

    // Helper method to build attempt result
    private AttemptResultDTO buildAttemptResult(QuizAttempt attempt, Quiz quiz, List<QuizUserAnswer> userAnswers) {
        AttemptResultDTO result = new AttemptResultDTO();
        result.setAttemptId(attempt.getId());
        result.setScore(attempt.getScore());
        result.setPassed(attempt.getPassed());
        result.setTimeSpentSeconds(attempt.getTimeSpentSeconds());
        result.setCompletedAt(attempt.getCompletedAt());

        List<QuestionResultDTO> questionResults = quiz.getQuestions().stream()
            .map(question -> {
                QuestionResultDTO qResult = new QuestionResultDTO();
                qResult.setQuestionId(question.getId());
                qResult.setQuestionText(question.getQuestionText());
                qResult.setQuestionType(question.getQuestionType().name());
                qResult.setPointsPossible(question.getPoints());
                qResult.setExplanation(question.getExplanation());

                // Find user answer for this question
                QuizUserAnswer userAnswer = userAnswers.stream()
                    .filter(ua -> ua.getQuestion().getId().equals(question.getId()))
                    .findFirst()
                    .orElse(null);

                if (userAnswer != null) {
                    qResult.setIsCorrect(userAnswer.getIsCorrect());
                    qResult.setPointsEarned(userAnswer.getPointsEarned());

                    // For TRUE_FALSE (single selection)
                    if (userAnswer.getSelectedOption() != null) {
                        qResult.setSelectedOptionId(userAnswer.getSelectedOption().getId());
                        qResult.setSelectedOptionText(userAnswer.getSelectedOption().getOptionText());
                    }

                    // For MULTIPLE_CHOICE (multiple selections)
                    if (userAnswer.getSelectedOptionIds() != null && !userAnswer.getSelectedOptionIds().isEmpty()) {
                        qResult.setSelectedOptionIds(userAnswer.getSelectedOptionIdsList());
                    }

                    // For FILL_BLANK
                    if (userAnswer.getTextAnswer() != null) {
                        qResult.setTextAnswer(userAnswer.getTextAnswer());
                    }

                    // Show correct answers (if showFeedbackImmediately)
                    if (quiz.getShowFeedbackImmediately()) {
                        if (question.getQuestionType() == QuizQuestion.QuestionType.FILL_BLANK) {
                            // Show acceptable answers for fill blank
                            if (!question.getAnswerOptions().isEmpty()) {
                                String acceptableAnswers = question.getAnswerOptions().get(0).getAcceptableAnswers();
                                qResult.setAcceptableAnswers(acceptableAnswers);
                            }
                        } else {
                            // Show all correct options for multiple choice / true-false
                            List<String> correctTexts = question.getAnswerOptions().stream()
                                .filter(opt -> opt.getIsCorrect())
                                .map(QuizAnswerOption::getOptionText)
                                .collect(Collectors.toList());
                            qResult.setCorrectOptionTexts(correctTexts);
                        }
                    }
                } else {
                    qResult.setIsCorrect(false);
                    qResult.setPointsEarned(0);
                }

                return qResult;
            })
            .collect(Collectors.toList());

        result.setQuestionResults(questionResults);

        return result;
    }
}

