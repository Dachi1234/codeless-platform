package com.codeless.backend.web.api.admin;

import com.codeless.backend.domain.*;
import com.codeless.backend.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/quizzes")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminQuizController {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAnswerOptionRepository quizAnswerOptionRepository;
    private final LessonRepository lessonRepository;

    // ==================== DTOs ====================
    
    @Data
    public static class QuizCreateDTO {
        private Long lessonId;
        private String title;
        private String description;
        private Integer passingScore = 70;
        private Integer timeLimitMinutes;
        private Boolean randomizeQuestions = false;
        private Boolean showFeedbackImmediately = true;
        private Integer maxAttempts;
    }

    @Data
    public static class QuizUpdateDTO {
        private String title;
        private String description;
        private Integer passingScore;
        private Integer timeLimitMinutes;
        private Boolean randomizeQuestions;
        private Boolean showFeedbackImmediately;
        private Integer maxAttempts;
    }

    @Data
    public static class QuizResponseDTO {
        private Long id;
        private Long lessonId;
        private String title;
        private String description;
        private Integer passingScore;
        private Integer timeLimitMinutes;
        private Boolean randomizeQuestions;
        private Boolean showFeedbackImmediately;
        private Integer maxAttempts;
        private Integer questionCount;

        public static QuizResponseDTO from(Quiz quiz) {
            QuizResponseDTO dto = new QuizResponseDTO();
            dto.setId(quiz.getId());
            dto.setLessonId(quiz.getLesson().getId());
            dto.setTitle(quiz.getTitle());
            dto.setDescription(quiz.getDescription());
            dto.setPassingScore(quiz.getPassingScore());
            dto.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
            dto.setRandomizeQuestions(quiz.getRandomizeQuestions());
            dto.setShowFeedbackImmediately(quiz.getShowFeedbackImmediately());
            dto.setMaxAttempts(quiz.getMaxAttempts());
            dto.setQuestionCount(quiz.getQuestions() != null ? quiz.getQuestions().size() : 0);
            return dto;
        }
    }

    @Data
    public static class QuestionCreateDTO {
        private Long quizId;
        private String questionType; // MULTIPLE_CHOICE, TRUE_FALSE, etc.
        private String questionText;
        private String explanation;
        private Integer points = 1;
        private Integer questionOrder;
        private List<AnswerOptionDTO> answerOptions = new ArrayList<>();
    }

    @Data
    public static class QuestionUpdateDTO {
        private String questionType;
        private String questionText;
        private String explanation;
        private Integer points;
        private Integer questionOrder;
    }

    @Data
    public static class AnswerOptionDTO {
        private Long id;
        private String optionText;
        private Boolean isCorrect;
        private Integer optionOrder;
    }

    @Data
    public static class QuestionResponseDTO {
        private Long id;
        private Long quizId;
        private String questionType;
        private String questionText;
        private String explanation;
        private Integer points;
        private Integer questionOrder;
        private List<AnswerOptionDTO> answerOptions;

        public static QuestionResponseDTO from(QuizQuestion question) {
            QuestionResponseDTO dto = new QuestionResponseDTO();
            dto.setId(question.getId());
            dto.setQuizId(question.getQuiz().getId());
            dto.setQuestionType(question.getQuestionType().name());
            dto.setQuestionText(question.getQuestionText());
            dto.setExplanation(question.getExplanation());
            dto.setPoints(question.getPoints());
            dto.setQuestionOrder(question.getQuestionOrder());
            
            if (question.getAnswerOptions() != null) {
                dto.setAnswerOptions(question.getAnswerOptions().stream()
                    .map(option -> {
                        AnswerOptionDTO optDto = new AnswerOptionDTO();
                        optDto.setId(option.getId());
                        optDto.setOptionText(option.getOptionText());
                        optDto.setIsCorrect(option.getIsCorrect());
                        optDto.setOptionOrder(option.getOptionOrder());
                        return optDto;
                    })
                    .collect(Collectors.toList()));
            }
            
            return dto;
        }
    }

    // ==================== Quiz CRUD ====================

    @PostMapping
    @Transactional
    public ResponseEntity<QuizResponseDTO> createQuiz(@RequestBody QuizCreateDTO dto) {
        Lesson lesson = lessonRepository.findById(dto.getLessonId())
            .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        if (quizRepository.existsByLessonId(lesson.getId())) {
            throw new IllegalStateException("Quiz already exists for this lesson");
        }

        Quiz quiz = new Quiz();
        quiz.setLesson(lesson);
        quiz.setTitle(dto.getTitle());
        quiz.setDescription(dto.getDescription());
        quiz.setPassingScore(dto.getPassingScore());
        quiz.setTimeLimitMinutes(dto.getTimeLimitMinutes());
        quiz.setRandomizeQuestions(dto.getRandomizeQuestions());
        quiz.setShowFeedbackImmediately(dto.getShowFeedbackImmediately());
        quiz.setMaxAttempts(dto.getMaxAttempts());

        Quiz saved = quizRepository.save(quiz);
        return ResponseEntity.ok(QuizResponseDTO.from(saved));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<QuizResponseDTO> getQuiz(@PathVariable Long id) {
        Quiz quiz = quizRepository.findByIdWithQuestions(id)
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        return ResponseEntity.ok(QuizResponseDTO.from(quiz));
    }

    @GetMapping("/lesson/{lessonId}")
    @Transactional(readOnly = true)
    public ResponseEntity<QuizResponseDTO> getQuizByLessonId(@PathVariable Long lessonId) {
        Quiz quiz = quizRepository.findByLessonId(lessonId)
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found for this lesson"));
        return ResponseEntity.ok(QuizResponseDTO.from(quiz));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<QuizResponseDTO> updateQuiz(@PathVariable Long id, @RequestBody QuizUpdateDTO dto) {
        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        if (dto.getTitle() != null) quiz.setTitle(dto.getTitle());
        if (dto.getDescription() != null) quiz.setDescription(dto.getDescription());
        if (dto.getPassingScore() != null) quiz.setPassingScore(dto.getPassingScore());
        if (dto.getTimeLimitMinutes() != null) quiz.setTimeLimitMinutes(dto.getTimeLimitMinutes());
        if (dto.getRandomizeQuestions() != null) quiz.setRandomizeQuestions(dto.getRandomizeQuestions());
        if (dto.getShowFeedbackImmediately() != null) quiz.setShowFeedbackImmediately(dto.getShowFeedbackImmediately());
        if (dto.getMaxAttempts() != null) quiz.setMaxAttempts(dto.getMaxAttempts());

        Quiz saved = quizRepository.save(quiz);
        return ResponseEntity.ok(QuizResponseDTO.from(saved));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        if (!quizRepository.existsById(id)) {
            throw new IllegalArgumentException("Quiz not found");
        }
        quizRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Question CRUD ====================

    @PostMapping("/questions")
    @Transactional
    public ResponseEntity<QuestionResponseDTO> createQuestion(@RequestBody QuestionCreateDTO dto) {
        Quiz quiz = quizRepository.findById(dto.getQuizId())
            .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        QuizQuestion question = new QuizQuestion();
        question.setQuiz(quiz);
        question.setQuestionType(QuizQuestion.QuestionType.valueOf(dto.getQuestionType()));
        question.setQuestionText(dto.getQuestionText());
        question.setExplanation(dto.getExplanation());
        question.setPoints(dto.getPoints());

        // Auto-calculate question order if not provided
        if (dto.getQuestionOrder() == null) {
            Integer maxOrder = quizQuestionRepository.findMaxQuestionOrderByQuizId(quiz.getId()).orElse(0);
            question.setQuestionOrder(maxOrder + 1);
        } else {
            question.setQuestionOrder(dto.getQuestionOrder());
        }

        QuizQuestion savedQuestion = quizQuestionRepository.save(question);

        // Create answer options
        if (dto.getAnswerOptions() != null && !dto.getAnswerOptions().isEmpty()) {
            for (AnswerOptionDTO optDto : dto.getAnswerOptions()) {
                QuizAnswerOption option = new QuizAnswerOption();
                option.setQuestion(savedQuestion);
                option.setOptionText(optDto.getOptionText());
                option.setIsCorrect(optDto.getIsCorrect() != null ? optDto.getIsCorrect() : false);
                
                if (optDto.getOptionOrder() == null) {
                    Integer maxOptOrder = quizAnswerOptionRepository.findMaxOptionOrderByQuestionId(savedQuestion.getId()).orElse(0);
                    option.setOptionOrder(maxOptOrder + 1);
                } else {
                    option.setOptionOrder(optDto.getOptionOrder());
                }
                
                quizAnswerOptionRepository.save(option);
            }
        }

        // Reload with options
        QuizQuestion reloaded = quizQuestionRepository.findByIdWithOptions(savedQuestion.getId())
            .orElseThrow(() -> new IllegalArgumentException("Question not found after save"));

        return ResponseEntity.ok(QuestionResponseDTO.from(reloaded));
    }

    @GetMapping("/questions/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<QuestionResponseDTO> getQuestion(@PathVariable Long id) {
        QuizQuestion question = quizQuestionRepository.findByIdWithOptions(id)
            .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        return ResponseEntity.ok(QuestionResponseDTO.from(question));
    }

    @GetMapping("/{quizId}/questions")
    @Transactional(readOnly = true)
    public ResponseEntity<List<QuestionResponseDTO>> getQuestionsByQuizId(@PathVariable Long quizId) {
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByQuestionOrder(quizId);
        
        // Fetch options for each question
        List<QuestionResponseDTO> dtos = questions.stream()
            .map(q -> {
                QuizQuestion withOptions = quizQuestionRepository.findByIdWithOptions(q.getId())
                    .orElse(q);
                return QuestionResponseDTO.from(withOptions);
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/questions/{id}")
    @Transactional
    public ResponseEntity<QuestionResponseDTO> updateQuestion(@PathVariable Long id, @RequestBody QuestionUpdateDTO dto) {
        QuizQuestion question = quizQuestionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        if (dto.getQuestionType() != null) {
            question.setQuestionType(QuizQuestion.QuestionType.valueOf(dto.getQuestionType()));
        }
        if (dto.getQuestionText() != null) question.setQuestionText(dto.getQuestionText());
        if (dto.getExplanation() != null) question.setExplanation(dto.getExplanation());
        if (dto.getPoints() != null) question.setPoints(dto.getPoints());
        if (dto.getQuestionOrder() != null) question.setQuestionOrder(dto.getQuestionOrder());

        QuizQuestion saved = quizQuestionRepository.save(question);
        QuizQuestion reloaded = quizQuestionRepository.findByIdWithOptions(saved.getId())
            .orElseThrow(() -> new IllegalArgumentException("Question not found after update"));
        
        return ResponseEntity.ok(QuestionResponseDTO.from(reloaded));
    }

    @DeleteMapping("/questions/{id}")
    @Transactional
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        if (!quizQuestionRepository.existsById(id)) {
            throw new IllegalArgumentException("Question not found");
        }
        quizQuestionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Answer Option CRUD ====================

    @PostMapping("/questions/{questionId}/options")
    @Transactional
    public ResponseEntity<AnswerOptionDTO> createAnswerOption(
            @PathVariable Long questionId,
            @RequestBody AnswerOptionDTO dto) {
        
        QuizQuestion question = quizQuestionRepository.findById(questionId)
            .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        QuizAnswerOption option = new QuizAnswerOption();
        option.setQuestion(question);
        option.setOptionText(dto.getOptionText());
        option.setIsCorrect(dto.getIsCorrect() != null ? dto.getIsCorrect() : false);

        if (dto.getOptionOrder() == null) {
            Integer maxOrder = quizAnswerOptionRepository.findMaxOptionOrderByQuestionId(questionId).orElse(0);
            option.setOptionOrder(maxOrder + 1);
        } else {
            option.setOptionOrder(dto.getOptionOrder());
        }

        QuizAnswerOption saved = quizAnswerOptionRepository.save(option);

        AnswerOptionDTO response = new AnswerOptionDTO();
        response.setId(saved.getId());
        response.setOptionText(saved.getOptionText());
        response.setIsCorrect(saved.getIsCorrect());
        response.setOptionOrder(saved.getOptionOrder());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/options/{id}")
    @Transactional
    public ResponseEntity<AnswerOptionDTO> updateAnswerOption(
            @PathVariable Long id,
            @RequestBody AnswerOptionDTO dto) {
        
        QuizAnswerOption option = quizAnswerOptionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Answer option not found"));

        if (dto.getOptionText() != null) option.setOptionText(dto.getOptionText());
        if (dto.getIsCorrect() != null) option.setIsCorrect(dto.getIsCorrect());
        if (dto.getOptionOrder() != null) option.setOptionOrder(dto.getOptionOrder());

        QuizAnswerOption saved = quizAnswerOptionRepository.save(option);

        AnswerOptionDTO response = new AnswerOptionDTO();
        response.setId(saved.getId());
        response.setOptionText(saved.getOptionText());
        response.setIsCorrect(saved.getIsCorrect());
        response.setOptionOrder(saved.getOptionOrder());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/options/{id}")
    @Transactional
    public ResponseEntity<Void> deleteAnswerOption(@PathVariable Long id) {
        if (!quizAnswerOptionRepository.existsById(id)) {
            throw new IllegalArgumentException("Answer option not found");
        }
        quizAnswerOptionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

