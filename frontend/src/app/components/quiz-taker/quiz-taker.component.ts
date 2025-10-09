import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AnswerOption {
  id: number;
  optionText: string;
}

interface Question {
  id: number;
  questionType: string;
  questionText: string;
  points: number;
  answerOptions: AnswerOption[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  passingScore: number;
  timeLimitMinutes?: number;
  randomizeQuestions: boolean;
  maxAttempts?: number;
  attemptCount: number;
  canAttempt: boolean;
  questions: Question[];
}

interface UserAnswer {
  questionId: number;
  selectedOptionId?: number;
  textAnswer?: string;
}

@Component({
  selector: 'app-quiz-taker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-taker.component.html',
  styleUrl: './quiz-taker.component.scss'
})
export class QuizTakerComponent implements OnInit, OnDestroy {
  @Input() quizId!: number;
  @Output() complete = new EventEmitter<number>(); // Emits attemptId
  @Output() close = new EventEmitter<void>();

  quiz: Quiz | null = null;
  loading = false;
  submitting = false;
  error = '';

  // Quiz attempt
  attemptId: number | null = null;
  startTime: Date | null = null;
  timeRemaining: number | null = null;
  timerInterval: any = null;

  // User answers
  userAnswers: Map<number, UserAnswer> = new Map();

  // Current question
  currentQuestionIndex = 0;

  // Quiz state
  quizStarted = false;
  quizCompleted = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadQuiz();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  loadQuiz() {
    this.loading = true;
    this.http.get<Quiz>(`/api/quizzes/${this.quizId}/take`)
      .subscribe({
        next: (quiz) => {
          this.quiz = quiz;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load quiz';
          this.loading = false;
        }
      });
  }

  startQuiz() {
    this.loading = true;
    this.http.post<{attemptId: number, startedAt: string, timeLimitMinutes?: number}>
      (`/api/quizzes/${this.quizId}/start`, {})
      .subscribe({
        next: (response) => {
          this.attemptId = response.attemptId;
          this.startTime = new Date(response.startedAt);
          this.quizStarted = true;
          this.loading = false;

          if (response.timeLimitMinutes) {
            this.timeRemaining = response.timeLimitMinutes * 60; // Convert to seconds
            this.startTimer();
          }
        },
        error: () => {
          this.error = 'Failed to start quiz';
          this.loading = false;
        }
      });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining! > 0) {
        this.timeRemaining!--;
      } else {
        this.submitQuiz(); // Auto-submit when time runs out
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getTimeRemainingDisplay(): string {
    if (!this.timeRemaining) return '';
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  selectAnswer(questionId: number, optionId: number) {
    this.userAnswers.set(questionId, {
      questionId,
      selectedOptionId: optionId
    });
  }

  setTextAnswer(questionId: number, text: string) {
    this.userAnswers.set(questionId, {
      questionId,
      textAnswer: text
    });
  }

  getSelectedOptionId(questionId: number): number | undefined {
    return this.userAnswers.get(questionId)?.selectedOptionId;
  }

  getTextAnswer(questionId: number): string {
    return this.userAnswers.get(questionId)?.textAnswer || '';
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.quiz!.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
  }

  isQuestionAnswered(questionId: number): boolean {
    return this.userAnswers.has(questionId);
  }

  getAnsweredCount(): number {
    return this.userAnswers.size;
  }

  canSubmit(): boolean {
    return this.userAnswers.size === this.quiz!.questions.length;
  }

  submitQuiz() {
    if (!this.attemptId || !this.quiz) return;

    this.submitting = true;
    this.stopTimer();

    const answers = Array.from(this.userAnswers.values());

    this.http.post<any>('/api/quizzes/submit', {
      attemptId: this.attemptId,
      answers
    }).subscribe({
      next: (result) => {
        this.submitting = false;
        this.quizCompleted = true;
        this.complete.emit(this.attemptId!);
      },
      error: () => {
        this.error = 'Failed to submit quiz';
        this.submitting = false;
      }
    });
  }

  getCurrentQuestion(): Question | null {
    return this.quiz ? this.quiz.questions[this.currentQuestionIndex] : null;
  }

  closeQuiz() {
    this.close.emit();
  }
}

