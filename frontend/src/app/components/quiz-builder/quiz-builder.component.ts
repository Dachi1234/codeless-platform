import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AnswerOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
  optionOrder?: number;
}

interface Question {
  id?: number;
  questionType: string;
  questionText: string;
  explanation: string;
  points: number;
  questionOrder?: number;
  answerOptions: AnswerOption[];
}

interface Quiz {
  id?: number;
  lessonId: number;
  title: string;
  description: string;
  passingScore: number;
  timeLimitMinutes?: number;
  randomizeQuestions: boolean;
  showFeedbackImmediately: boolean;
  maxAttempts?: number;
  questionCount?: number;
}

@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-builder.component.html',
  styleUrl: './quiz-builder.component.scss'
})
export class QuizBuilderComponent implements OnInit {
  @Input() lessonId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  quiz: Quiz | null = null;
  questions: Question[] = [];
  loading = false;
  saving = false;
  error = '';

  // Quiz form
  quizForm: Quiz = {
    lessonId: 0,
    title: '',
    description: '',
    passingScore: 70,
    timeLimitMinutes: undefined,
    randomizeQuestions: false,
    showFeedbackImmediately: true,
    maxAttempts: undefined
  };

  // Question form
  showQuestionModal = false;
  editingQuestion: Question | null = null;
  questionForm: Question = this.getEmptyQuestion();

  // Question types
  questionTypes = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'FILL_BLANK', label: 'Fill in the Blank' },
    { value: 'SHORT_ANSWER', label: 'Short Answer' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.quizForm.lessonId = this.lessonId;
    this.loadQuiz();
  }

  loadQuiz() {
    this.loading = true;
    this.http.get<Quiz>(`/api/admin/quizzes/lesson/${this.lessonId}`)
      .subscribe({
        next: (quiz) => {
          this.quiz = quiz;
          this.quizForm = { ...quiz };
          this.loadQuestions();
        },
        error: (err) => {
          if (err.status === 404 || err.error?.message?.includes('not found')) {
            // Quiz doesn't exist yet, that's okay
            this.quiz = null;
            this.loading = false;
          } else {
            this.error = 'Failed to load quiz';
            this.loading = false;
          }
        }
      });
  }

  loadQuestions() {
    if (!this.quiz?.id) return;
    
    this.http.get<Question[]>(`/api/admin/quizzes/${this.quiz.id}/questions`)
      .subscribe({
        next: (questions) => {
          this.questions = questions;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load questions';
          this.loading = false;
        }
      });
  }

  saveQuiz() {
    this.saving = true;
    this.error = '';

    const request = this.quiz?.id
      ? this.http.put<Quiz>(`/api/admin/quizzes/${this.quiz.id}`, this.quizForm)
      : this.http.post<Quiz>('/api/admin/quizzes', this.quizForm);

    request.subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.quizForm = { ...quiz };
        this.saving = false;
        if (!this.quiz.id) {
          this.loadQuestions(); // Load questions after creating quiz
        }
      },
      error: () => {
        this.error = 'Failed to save quiz';
        this.saving = false;
      }
    });
  }

  openQuestionModal(question?: Question) {
    if (question) {
      this.editingQuestion = question;
      this.questionForm = { ...question, answerOptions: [...question.answerOptions] };
    } else {
      this.editingQuestion = null;
      this.questionForm = this.getEmptyQuestion();
    }
    this.showQuestionModal = true;
  }

  closeQuestionModal() {
    this.showQuestionModal = false;
    this.editingQuestion = null;
    this.questionForm = this.getEmptyQuestion();
  }

  saveQuestion() {
    if (!this.quiz?.id) {
      this.error = 'Please save the quiz first';
      return;
    }

    this.saving = true;
    this.error = '';

    const payload = {
      ...this.questionForm,
      quizId: this.quiz.id
    };

    const request = this.editingQuestion?.id
      ? this.http.put<Question>(`/api/admin/quizzes/questions/${this.editingQuestion.id}`, this.questionForm)
      : this.http.post<Question>('/api/admin/quizzes/questions', payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeQuestionModal();
        this.loadQuestions();
      },
      error: () => {
        this.error = 'Failed to save question';
        this.saving = false;
      }
    });
  }

  deleteQuestion(question: Question) {
    if (!confirm('Are you sure you want to delete this question?')) return;

    this.http.delete(`/api/admin/quizzes/questions/${question.id}`)
      .subscribe({
        next: () => {
          this.loadQuestions();
        },
        error: () => {
          this.error = 'Failed to delete question';
        }
      });
  }

  addAnswerOption() {
    this.questionForm.answerOptions.push({
      optionText: '',
      isCorrect: false,
      optionOrder: this.questionForm.answerOptions.length + 1
    });
  }

  removeAnswerOption(index: number) {
    this.questionForm.answerOptions.splice(index, 1);
  }

  setCorrectAnswer(index: number) {
    // For multiple choice, only one answer can be correct
    if (this.questionForm.questionType === 'MULTIPLE_CHOICE') {
      this.questionForm.answerOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else if (this.questionForm.questionType === 'TRUE_FALSE') {
      // For true/false, only two options and one must be correct
      this.questionForm.answerOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    }
  }

  onQuestionTypeChange() {
    // Reset answer options when changing question type
    if (this.questionForm.questionType === 'TRUE_FALSE') {
      this.questionForm.answerOptions = [
        { optionText: 'True', isCorrect: false, optionOrder: 1 },
        { optionText: 'False', isCorrect: false, optionOrder: 2 }
      ];
    } else if (this.questionForm.questionType === 'MULTIPLE_CHOICE') {
      this.questionForm.answerOptions = [
        { optionText: '', isCorrect: false, optionOrder: 1 }
      ];
    } else {
      // Fill blank or short answer don't need options
      this.questionForm.answerOptions = [];
    }
  }

  needsAnswerOptions(): boolean {
    return this.questionForm.questionType === 'MULTIPLE_CHOICE' || 
           this.questionForm.questionType === 'TRUE_FALSE';
  }

  closeBuilder() {
    this.close.emit();
  }

  onSaved() {
    this.saved.emit();
    this.close.emit();
  }

  private getEmptyQuestion(): Question {
    return {
      questionType: 'MULTIPLE_CHOICE',
      questionText: '',
      explanation: '',
      points: 1,
      answerOptions: []
    };
  }
}

