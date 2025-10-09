import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface QuestionResult {
  questionId: number;
  questionText: string;
  questionType: string;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
  explanation?: string;
  selectedOptionId?: number;
  selectedOptionText?: string;
  correctOptionText?: string;
  textAnswer?: string;
}

interface AttemptResult {
  attemptId: number;
  score: number;
  passed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
  questionResults: QuestionResult[];
}

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-results.component.html',
  styleUrl: './quiz-results.component.scss'
})
export class QuizResultsComponent implements OnInit {
  @Input() attemptId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() retake = new EventEmitter<void>();

  result: AttemptResult | null = null;
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadResults();
  }

  loadResults() {
    this.loading = true;
    this.http.get<AttemptResult>(`/api/quizzes/attempts/${this.attemptId}/result`)
      .subscribe({
        next: (result) => {
          this.result = result;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load quiz results';
          this.loading = false;
        }
      });
  }

  getTimeSpentDisplay(): string {
    if (!this.result) return '';
    const minutes = Math.floor(this.result.timeSpentSeconds / 60);
    const seconds = this.result.timeSpentSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }

  getTotalPoints(): number {
    return this.result?.questionResults.reduce((sum, q) => sum + q.pointsPossible, 0) || 0;
  }

  getEarnedPoints(): number {
    return this.result?.questionResults.reduce((sum, q) => sum + q.pointsEarned, 0) || 0;
  }

  getCorrectCount(): number {
    return this.result?.questionResults.filter(q => q.isCorrect).length || 0;
  }

  closeResults() {
    this.close.emit();
  }

  retakeQuiz() {
    this.retake.emit();
  }
}

