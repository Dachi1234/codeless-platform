import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Course, CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { VideoPlayerComponent } from '../../components/video-player/video-player.component';
import { ArticleViewerComponent } from '../../components/article-viewer/article-viewer.component';
import { QuizTakerComponent } from '../../components/quiz-taker/quiz-taker.component';
import { QuizResultsComponent } from '../../components/quiz-results/quiz-results.component';

interface CurriculumLesson {
  id: number;
  title: string;
  description: string;
  lessonType: string;
  contentUrl: string;
  durationMinutes: number;
  lessonOrder: number;
  isPreview: boolean;
  completed: boolean;
  lastPositionSeconds: number;
  timeSpentSeconds: number;
}

interface CurriculumSection {
  id: number;
  title: string;
  description: string;
  sectionOrder: number;
  lessons: CurriculumLesson[];
}

interface LiveSession {
  id: number;
  sessionNumber: number;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  zoomLink?: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  recordingUrl?: string;
}

@Component({
  selector: 'app-course-learn',
  standalone: true,
  imports: [CommonModule, RouterLink, VideoPlayerComponent, ArticleViewerComponent, QuizTakerComponent, QuizResultsComponent],
  templateUrl: './course-learn.component.html',
  styleUrls: ['./course-learn.component.scss']
})
export class CourseLearnComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly courseService = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly authService = inject(AuthService);

  course: Course | null = null;
  isEnrolled = false;
  loading = true;
  currentLessonId: number | null = null;
  selectedSection = 0;
  curriculum: CurriculumSection[] = [];
  liveSessions: LiveSession[] = [];
  
  // Quiz state
  showingQuiz = false;
  showingQuizResults = false;
  currentQuizId: number | null = null;
  currentQuizAttemptId: number | null = null;

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/courses/${courseId}/learn` }
      });
      return;
    }

    // Check if user is enrolled
    this.enrollmentService.isEnrolled(courseId).subscribe({
      next: (enrolled) => {
        this.isEnrolled = enrolled;
        if (!enrolled) {
          // Redirect to course detail if not enrolled
          this.router.navigate(['/courses', courseId]);
          return;
        }

        // Load course details
        this.courseService.get(courseId).subscribe({
          next: (course: Course) => {
            this.course = course;
            // Load curriculum
            this.loadCurriculum(courseId);
            // Load live sessions if this is a LIVE course
            if (course.kind === 'LIVE') {
              this.loadLiveSessions(courseId);
            }
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/courses']);
          }
        });
      },
      error: () => {
        this.router.navigate(['/courses', courseId]);
      }
    });
  }

  loadCurriculum(courseId: number): void {
    this.http.get<{sections: CurriculumSection[]}>(`/api/courses/${courseId}/curriculum`).subscribe({
      next: (response) => {
        this.curriculum = response.sections;
        if (this.curriculum.length > 0 && this.curriculum[0].lessons.length > 0) {
          this.currentLessonId = this.curriculum[0].lessons[0].id;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading curriculum:', err);
        this.loading = false;
      }
    });
  }

  loadLiveSessions(courseId: number): void {
    console.log(`%c[Learn Page] Loading live sessions for course ${courseId}`, 'color: purple; font-weight: bold');
    this.http.get<LiveSession[]>(`/api/courses/${courseId}/sessions`).subscribe({
      next: (sessions) => {
        console.log(`%c[Learn Page] ✓ Loaded ${sessions.length} sessions`, 'color: green; font-weight: bold');
        this.liveSessions = sessions;
      },
      error: (err) => {
        console.error('%c[Learn Page] ✗ Error loading sessions:', 'color: red; font-weight: bold', err);
        this.liveSessions = [];
      }
    });
  }

  getUpcomingSessions(): LiveSession[] {
    return this.liveSessions.filter(s => s.status === 'SCHEDULED' || s.status === 'LIVE');
  }

  getPastSessions(): LiveSession[] {
    return this.liveSessions.filter(s => s.status === 'COMPLETED');
  }

  selectLesson(sectionIndex: number, lessonId: number): void {
    this.selectedSection = sectionIndex;
    this.currentLessonId = lessonId;
    
    // Check if this is a quiz lesson
    const lesson = this.getCurrentLesson();
    if (lesson && lesson.lessonType === 'QUIZ') {
      this.loadQuizForLesson(lessonId);
    } else {
      // Reset quiz state for non-quiz lessons
      this.showingQuiz = false;
      this.showingQuizResults = false;
      this.currentQuizId = null;
    }
  }
  
  loadQuizForLesson(lessonId: number): void {
    // Load quiz by lesson ID
    this.http.get<{id: number}>(`/api/admin/quizzes/lesson/${lessonId}`)
      .subscribe({
        next: (quiz) => {
          this.currentQuizId = quiz.id;
          this.showingQuiz = true;
          this.showingQuizResults = false;
        },
        error: (err) => {
          console.error('Failed to load quiz:', err);
          alert('Quiz not available for this lesson');
        }
      });
  }
  
  onQuizComplete(attemptId: number): void {
    this.currentQuizAttemptId = attemptId;
    this.showingQuiz = false;
    this.showingQuizResults = true;
    
    // Mark lesson as complete
    this.markCurrentLessonComplete();
    
    // Auto-advance to next lesson after showing results
    setTimeout(() => {
      this.nextLesson();
    }, 3000); // 3 seconds delay to allow user to see quiz results
  }
  
  onQuizResultsClose(): void {
    this.showingQuizResults = false;
    this.currentQuizAttemptId = null;
  }
  
  onQuizRetake(): void {
    this.showingQuizResults = false;
    this.showingQuiz = true;
  }
  
  onQuizClose(): void {
    this.showingQuiz = false;
    this.currentQuizId = null;
  }

  toggleLessonComplete(sectionIndex: number, lessonIndex: number): void {
    const lesson = this.curriculum[sectionIndex].lessons[lessonIndex];
    const newCompletedState = !lesson.completed;
    
    // Update backend
    this.http.post(`/api/lessons/${lesson.id}/complete`, {
      positionSeconds: 0,
      timeSpentSeconds: lesson.durationMinutes ? lesson.durationMinutes * 60 : 0
    }).subscribe({
      next: () => {
        // Update local state
        lesson.completed = newCompletedState;
        
        // Auto-advance to next lesson if just completed
        if (newCompletedState) {
          setTimeout(() => {
            this.nextLesson();
          }, 1000); // 1 second delay for smooth transition
        }
      },
      error: (err) => {
        console.error('Error marking lesson complete:', err);
      }
    });
  }

  nextLesson(): void {
    // Find current lesson and move to next
    for (let i = 0; i < this.curriculum.length; i++) {
      const lessons = this.curriculum[i].lessons;
      const currentIndex = lessons.findIndex(l => l.id === this.currentLessonId);
      if (currentIndex !== -1) {
        if (currentIndex < lessons.length - 1) {
          // Next lesson in same section
          this.currentLessonId = lessons[currentIndex + 1].id;
          this.selectedSection = i;
          return;
        } else if (i < this.curriculum.length - 1 && this.curriculum[i + 1].lessons.length > 0) {
          // First lesson of next section
          this.currentLessonId = this.curriculum[i + 1].lessons[0].id;
          this.selectedSection = i + 1;
          return;
        }
      }
    }
  }

  previousLesson(): void {
    // Find current lesson and move to previous
    for (let i = 0; i < this.curriculum.length; i++) {
      const lessons = this.curriculum[i].lessons;
      const currentIndex = lessons.findIndex(l => l.id === this.currentLessonId);
      if (currentIndex !== -1) {
        if (currentIndex > 0) {
          // Previous lesson in same section
          this.currentLessonId = lessons[currentIndex - 1].id;
          this.selectedSection = i;
          return;
        } else if (i > 0 && this.curriculum[i - 1].lessons.length > 0) {
          // Last lesson of previous section
          const prevSection = this.curriculum[i - 1];
          this.currentLessonId = prevSection.lessons[prevSection.lessons.length - 1].id;
          this.selectedSection = i - 1;
          return;
        }
      }
    }
  }

  getTotalLessons(): number {
    return this.curriculum.reduce((total, section) => total + section.lessons.length, 0);
  }

  getCompletedLessons(): number {
    return this.curriculum.reduce((total, section) => {
      return total + section.lessons.filter(l => l.completed).length;
    }, 0);
  }

  getProgressPercentage(): number {
    const total = this.getTotalLessons();
    const completed = this.getCompletedLessons();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getCurrentLesson(): CurriculumLesson | null {
    for (const section of this.curriculum) {
      const lesson = section.lessons.find(l => l.id === this.currentLessonId);
      if (lesson) return lesson;
    }
    return null;
  }

  onVideoProgress(progress: { position: number; timeSpent: number }): void {
    if (!this.currentLessonId) return;
    
    // Save progress to backend
    this.http.post(`/api/lessons/${this.currentLessonId}/complete`, {
      positionSeconds: progress.position,
      timeSpentSeconds: progress.timeSpent
    }).subscribe({
      next: () => {
        console.log('Progress saved:', progress);
      },
      error: (err) => {
        console.error('Error saving progress:', err);
      }
    });
  }

  markCurrentLessonComplete(): void {
    if (!this.currentLessonId) return;

    const currentLesson = this.getCurrentLesson();
    if (!currentLesson) return;

    this.http.post(`/api/lessons/${this.currentLessonId}/complete`, {
      positionSeconds: 0,
      timeSpentSeconds: currentLesson.durationMinutes ? currentLesson.durationMinutes * 60 : 0
    }).subscribe({
      next: () => {
        // Update local state
        currentLesson.completed = true;
        console.log('Lesson marked as complete');
      },
      error: (err) => {
        console.error('Error marking lesson complete:', err);
      }
    });
  }

  onVideoEnded(): void {
    this.markCurrentLessonComplete();
    
    // Auto-advance to next lesson
    setTimeout(() => {
      this.nextLesson();
    }, 2000);
  }

  onArticleComplete(): void {
    const currentLesson = this.getCurrentLesson();
    if (currentLesson) {
      currentLesson.completed = true;
    }
    
    // Auto-advance to next lesson
    setTimeout(() => {
      this.nextLesson();
    }, 2000); // 2 seconds delay for smooth transition
  }
}

