import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, CourseProgress } from '../../services/dashboard.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="my-courses-page">
      <div class="container">
        <div class="my-courses-page__header">
          <h1 class="h-1">My Courses</h1>
          <p class="my-courses-page__subtitle">Continue learning where you left off</p>
        </div>

        <div class="my-courses-page__loading" *ngIf="isLoading">
          Loading your courses...
        </div>

        <div class="my-courses-page__empty" *ngIf="!isLoading && coursesWithProgress.length === 0">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h2>No Courses Yet</h2>
          <p>You haven't enrolled in any courses yet. Browse our catalog to get started!</p>
          <a routerLink="/courses" class="btn-primary">Browse Courses</a>
        </div>

        <ng-container *ngIf="!isLoading && coursesWithProgress.length > 0">
          <div class="my-courses-page__stats">
            <div class="stat-card">
              <div class="stat-number">{{ coursesWithProgress.length }}</div>
              <div class="stat-label">Enrolled Courses</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ getInProgressCount() }}</div>
              <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ getCompletedCount() }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>

          <div class="my-courses-page__grid">
            <div class="course-progress-card" *ngFor="let progress of coursesWithProgress">
              <img [src]="progress.course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=80&fit=crop'" 
                   [alt]="progress.course.title"
                   class="course-thumbnail">
              
              <div class="course-info">
                <h3 class="course-title">{{ progress.course.title }}</h3>
                <p class="course-instructor">{{ progress.course.instructorName || 'TBD' }}</p>
                
                <div class="course-meta">
                  <span class="meta-badge" [class]="'badge-' + (progress.course.kind?.toLowerCase() || 'default')">
                    {{ progress.course.kind || 'N/A' }}
                  </span>
                  <span class="meta-item" *ngIf="progress.course.level">
                    {{ progress.course.level }}
                  </span>
                </div>

                <div class="progress-section">
                  <div class="progress-header">
                    <span class="progress-text">
                      Progress: {{ progress.lessonCompleted }}/{{ progress.lessonTotal }} lessons
                    </span>
                    <span class="progress-percent">{{ progress.completionPercentage }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="progress.completionPercentage"></div>
                  </div>
                  <div class="progress-footer">
                    <span class="time-spent">{{ progress.timeSpentSeconds > 0 ? formatTimeSpent(progress.timeSpentSeconds) : 'Not started yet' }}</span>
                    <span class="last-active">{{ progress.lastAccessedAt ? ('Last active: ' + (progress.lastAccessedAt | date:'M/d/yyyy')) : ('Enrolled: ' + (progress.enrolledAt | date:'M/d/yyyy')) }}</span>
                  </div>
                </div>
              </div>

              <div class="course-actions">
                <button class="btn-continue" [routerLink]="['/courses', progress.course.id, 'learn']">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                  </svg>
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </section>
  `,
  styles: [`
    .my-courses-page {
      padding: 40px 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .my-courses-page__header {
      text-align: center;
      margin-bottom: 40px;
      color: white;
    }

    .h-1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .my-courses-page__subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .my-courses-page__loading,
    .my-courses-page__empty {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .my-courses-page__empty svg {
      margin-bottom: 20px;
      stroke: #667eea;
    }

    .my-courses-page__empty h2 {
      font-size: 1.8rem;
      margin-bottom: 10px;
      color: #2D3748;
    }

    .my-courses-page__empty p {
      color: #718096;
      margin-bottom: 30px;
    }

    .btn-primary {
      display: inline-block;
      padding: 12px 32px;
      background: #667eea;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .my-courses-page__stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #718096;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .my-courses-page__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .course-progress-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .course-progress-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .course-thumbnail {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .course-info {
      padding: 20px;
      flex: 1;
    }

    .course-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2D3748;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .course-instructor {
      color: #718096;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }

    .course-meta {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .meta-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-pre_recorded {
      background: #E6FFFA;
      color: #047857;
    }

    .badge-live {
      background: #FEE2E2;
      color: #DC2626;
    }

    .badge-bundle {
      background: #FEF3C7;
      color: #D97706;
    }

    .meta-item {
      color: #718096;
      font-size: 0.85rem;
    }

    .progress-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .progress-text {
      font-size: 0.85rem;
      color: #4A5568;
      font-weight: 500;
    }

    .progress-percent {
      font-size: 0.9rem;
      font-weight: 700;
      color: #667eea;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #E2E8F0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .progress-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #A0AEC0;
    }

    .course-actions {
      padding: 16px 20px;
      background: #F7FAFC;
      border-top: 1px solid #E2E8F0;
    }

    .btn-continue {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .btn-continue:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .btn-continue svg {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 768px) {
      .my-courses-page__grid {
        grid-template-columns: 1fr;
      }

      .h-1 {
        font-size: 2rem;
      }
    }
  `]
})
export class MyCoursesComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  
  coursesWithProgress: CourseProgress[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    console.log('[MyCoursesPage] Loading courses with progress...');
    this.dashboardService.getCoursesWithProgress().subscribe({
      next: (courses) => {
        console.log('[MyCoursesPage] Courses loaded:', courses);
        this.coursesWithProgress = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[MyCoursesPage] Failed to load courses:', error);
        this.isLoading = false;
      }
    });
  }

  getInProgressCount(): number {
    return this.coursesWithProgress.filter(c => c.completionPercentage < 100).length;
  }

  getCompletedCount(): number {
    return this.coursesWithProgress.filter(c => c.completionPercentage === 100).length;
  }

  formatTimeSpent(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

