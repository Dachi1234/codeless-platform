import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe, DatePipe, NgIf, NgFor } from '@angular/common';
import { Course, CourseService } from '../../services/course.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { CourseReviewsComponent } from '../../components/course-reviews/course-reviews.component';

// Curriculum types
interface CurriculumLesson {
  id: number;
  title: string;
  contentType: string;
  durationMinutes?: number;
}

interface CurriculumSection {
  id: number;
  title: string;
  sectionOrder: number;
  lessons: CurriculumLesson[];
}

interface CurriculumResponse {
  sections: CurriculumSection[];
}

// Live Session types
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
  selector: 'app-course-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, AsyncPipe, CurrencyPipe, DatePipe, CourseReviewsComponent],
  template: `
    <section class="course-detail">
      <div class="container">
        <!-- Back Button -->
        <a routerLink="/courses" class="course-detail__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to Courses
        </a>

        <ng-container *ngIf="course$ | async as c">
          <div class="course-detail__layout">
            <!-- Left Column - Main Content -->
            <div class="course-detail__main">
              <!-- Course Header Card -->
              <div class="course-detail__header-card">
                <img [src]="c.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop'" 
                     [alt]="c.title" 
                     class="course-detail__thumbnail">
                
                <div class="course-detail__header-content">
                  <div class="course-detail__badges">
                    <span class="badge-live" *ngIf="c.kind === 'LIVE'">LIVE COURSE</span>
                    <span class="badge-live" *ngIf="c.kind === 'BUNDLE'">BUNDLE</span>
                    <span class="badge-category" *ngIf="c.category">{{ c.category }}</span>
                    <span class="badge-level" *ngIf="c.level">{{ c.level }}</span>
                  </div>
                  
                  <h1 class="course-detail__title">{{ c.title }}</h1>
                  <p class="course-detail__description">{{ c.description || 'Interactive live sessions covering SEO, Social Media, PPC, and Content Marketing.' }}</p>
                  
                  <div class="course-detail__meta">
                    <span class="meta-item" *ngIf="c.rating">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD95A" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {{ c.rating }} <span *ngIf="c.reviewCount">({{ c.reviewCount }} reviews)</span>
                    </span>
                    <span class="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ c.enrolledCount || 0 }} students
                    </span>
                    <span class="meta-item" *ngIf="c.durationHours || c.sessionCount">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      {{ c.durationHours ? c.durationHours + ' hours' : (c.sessionCount + ' sessions') }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Instructor -->
              <div class="course-detail__instructor" *ngIf="c.instructorName">
                <img [src]="c.instructorAvatarUrl || 'https://ui-avatars.com/api/?name=' + c.instructorName + '&background=5A8DEE&color=fff'" 
                     [alt]="c.instructorName" 
                     class="instructor-avatar">
                <div>
                  <div class="instructor-label">Instructor</div>
                  <div class="instructor-name">{{ c.instructorName }}</div>
                  <div class="instructor-title" *ngIf="c.instructorTitle">{{ c.instructorTitle }}</div>
                </div>
              </div>

              <!-- Tabs -->
              <div class="course-detail__tabs">
                <button class="tab" [class.tab--active]="activeTab === 'overview'" (click)="setActiveTab('overview')">Overview</button>
                <button class="tab" [class.tab--active]="activeTab === 'syllabus'" (click)="setActiveTab('syllabus')">Syllabus</button>
                <button class="tab" [class.tab--active]="activeTab === 'reviews'" (click)="setActiveTab('reviews')">Reviews</button>
                <button class="tab" [class.tab--active]="activeTab === 'schedule'" (click)="setActiveTab('schedule')" *ngIf="c.kind === 'LIVE'">Schedule</button>
              </div>

              <!-- Tab Content -->
              <div class="tab-content">
                <!-- Overview Tab -->
                <div class="course-detail__learn-section" *ngIf="activeTab === 'overview'">
                  <h2 class="section-title">Course Overview</h2>
                  <div class="course-description">
                    <p>{{ c.description || 'No description available.' }}</p>
                  </div>
                </div>

                <!-- Syllabus Tab -->
                <div class="course-detail__content-section" *ngIf="activeTab === 'syllabus'">
                  <h2 class="section-title">Course Syllabus</h2>
                  <ng-container *ngIf="curriculum$ | async as curriculum">
                    <div class="curriculum-sections" *ngIf="curriculum.sections && curriculum.sections.length > 0">
                      <div class="curriculum-section" *ngFor="let section of curriculum.sections">
                        <div class="section-header">
                          <h3 class="section-title-sm">{{ section.title }}</h3>
                          <span class="lesson-count">{{ section.lessons.length }} {{ section.lessons.length === 1 ? 'lesson' : 'lessons' }}</span>
                        </div>
                        <div class="section-lessons">
                          <div class="lesson-item" *ngFor="let lesson of section.lessons">
                            <div class="lesson-icon">
                              <svg *ngIf="lesson.contentType === 'VIDEO'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 3l14 9-14 9V3z" fill="#6366F1"/>
                              </svg>
                              <svg *ngIf="lesson.contentType === 'QUIZ'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 2L7 4H3v14h4l2 2h6l2-2h4V4h-4l-2-2H9z" stroke="#10B981" stroke-width="2" fill="none"/>
                                <circle cx="12" cy="11" r="1" fill="#10B981"/>
                                <path d="M12 14v2" stroke="#10B981" stroke-width="2"/>
                              </svg>
                              <svg *ngIf="lesson.contentType === 'TEXT'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6h16M4 12h16M4 18h10" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                              </svg>
                            </div>
                            <span class="lesson-title">{{ lesson.title }}</span>
                            <span class="lesson-duration" *ngIf="lesson.durationMinutes">{{ lesson.durationMinutes }} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p *ngIf="!curriculum.sections || curriculum.sections.length === 0" class="empty-message">
                      No curriculum available yet. Check back soon!
                    </p>
                  </ng-container>
                </div>

                <!-- Reviews Tab -->
                <div class="course-detail__content-section" *ngIf="activeTab === 'reviews'">
                  <app-course-reviews 
                    [courseId]="c.id" 
                    [canReview]="isEnrolled || false" 
                    [averageRating]="c.rating || 0">
                  </app-course-reviews>
                </div>

                <!-- Schedule Tab (Only for LIVE courses) -->
                <div class="course-detail__content-section" *ngIf="activeTab === 'schedule' && c.kind === 'LIVE'">
                  <h2 class="section-title">Live Session Schedule</h2>
                  
                  <ng-container *ngIf="liveSessions$ | async as sessions">
                    <div class="sessions-list" *ngIf="sessions && sessions.length > 0">
                      <div class="session-card" *ngFor="let session of sessions" 
                           [class.session-live]="session.status === 'LIVE'"
                           [class.session-completed]="session.status === 'COMPLETED'"
                           [class.session-cancelled]="session.status === 'CANCELLED'">
                        <div class="session-header">
                          <div class="session-number-badge">
                            Session {{ session.sessionNumber }}
                          </div>
                          <div class="session-status-badge" [ngClass]="'status-' + session.status.toLowerCase()">
                            {{ session.status === 'SCHEDULED' ? '📅 Upcoming' : 
                               session.status === 'LIVE' ? '🔴 Live Now' : 
                               session.status === 'COMPLETED' ? '✓ Completed' : 
                               '✗ Cancelled' }}
                          </div>
                        </div>
                        
                        <h3 class="session-title">{{ session.title }}</h3>
                        <p class="session-description" *ngIf="session.description">{{ session.description }}</p>
                        
                        <div class="session-details">
                          <div class="session-detail-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span>{{ session.scheduledAt | date:'EEEE, MMMM d, y' }}</span>
                          </div>
                          <div class="session-detail-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span>{{ session.scheduledAt | date:'h:mm a' }} ({{ session.durationMinutes }} minutes)</span>
                          </div>
                        </div>
                        
                        <!-- Zoom Link (only for enrolled users and SCHEDULED/LIVE sessions) -->
                        <div class="session-actions" *ngIf="isEnrolled && session.zoomLink && (session.status === 'SCHEDULED' || session.status === 'LIVE')">
                          <a [href]="session.zoomLink" target="_blank" class="btn-join-session" [class.btn-live]="session.status === 'LIVE'">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M15.5 7.5L19 5v14l-3.5-2.5M5 17a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            {{ session.status === 'LIVE' ? 'Join Live Session' : 'Join Session' }}
                          </a>
                        </div>
                        
                        <!-- Recording Link (only for completed sessions with recording) -->
                        <div class="session-actions" *ngIf="isEnrolled && session.recordingUrl && session.status === 'COMPLETED'">
                          <a [href]="session.recordingUrl" target="_blank" class="btn-watch-recording">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 3l14 9-14 9V3z" fill="currentColor"/>
                            </svg>
                            Watch Recording
                          </a>
                        </div>
                        
                        <!-- Enrollment Required Message -->
                        <div class="enrollment-required" *ngIf="!isEnrolled && (session.status === 'SCHEDULED' || session.status === 'LIVE')">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 12l2 2 4-4" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <span>Enroll in this course to access live sessions</span>
                        </div>
                      </div>
                    </div>
                    
                    <p *ngIf="!sessions || sessions.length === 0" class="empty-message">
                      No live sessions scheduled yet. Check back soon!
                    </p>
                  </ng-container>
                </div>
              </div>
            </div>

            <!-- Right Column - Sidebar (Sticky) -->
            <aside class="course-detail__sidebar">
              <div class="sidebar-card">
                <div class="sidebar-card__price-section">
                  <div class="price-main">{{ c.price | currency:'USD':'symbol':'1.0-0' }}</div>
                  <div class="price-old" *ngIf="c.originalPrice && c.originalPrice > c.price">
                    {{ c.originalPrice | currency:'USD':'symbol':'1.0-0' }}
                  </div>
                  <div class="price-save" *ngIf="c.originalPrice && c.originalPrice > c.price">
                    Save {{ (c.originalPrice - c.price) | currency:'USD':'symbol':'1.0-0' }}
                  </div>
                </div>

                <div class="sidebar-card__info">
                  <div class="info-row" *ngIf="c.kind === 'LIVE' && c.startDate">
                    <span class="info-label">Starts:</span>
                    <span class="info-value">{{ c.startDate | date:'M/d/yyyy' }}</span>
                  </div>
                  <div class="info-row" *ngIf="c.kind === 'LIVE' && c.endDate">
                    <span class="info-label">Ends:</span>
                    <span class="info-value">{{ c.endDate | date:'M/d/yyyy' }}</span>
                  </div>
                  <div class="info-row" *ngIf="c.durationHours">
                    <span class="info-label">Duration:</span>
                    <span class="info-value">{{ c.durationHours }} hours</span>
                  </div>
                  <div class="info-row" *ngIf="c.sessionCount">
                    <span class="info-label">Sessions:</span>
                    <span class="info-value">{{ c.sessionCount }}</span>
                  </div>
                  <div class="info-row" *ngIf="c.lessonCount">
                    <span class="info-label">Lessons:</span>
                    <span class="info-value">{{ c.lessonCount }}</span>
                  </div>
                  <div class="info-row" *ngIf="c.kind === 'LIVE' && c.maxStudents">
                    <span class="info-label">Enrolled:</span>
                    <span class="info-value">{{ c.enrolledCount || 0 }}/{{ c.maxStudents }}</span>
                  </div>
                </div>

                <div class="sidebar-card__features">
                  <div class="feature-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Lifetime access</span>
                  </div>
                  <div class="feature-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Certificate of completion</span>
                  </div>
                  <div class="feature-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div class="feature-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Live Q&A sessions</span>
                  </div>
                </div>

                <button class="btn-enroll" 
                        [disabled]="isAddingToCart || isEnrolled"
                        (click)="addToCartAndCheckout(c.id)"
                        *ngIf="!isEnrolled">
                  {{ isAddingToCart ? 'Adding...' : 'Enroll Now' }}
                </button>

                <button class="btn-enroll-enrolled" 
                        *ngIf="isEnrolled"
                        routerLink="/my-courses">
                  Go to My Courses
                </button>

                <button class="btn-add-cart" 
                        [disabled]="isAddingToCart || isEnrolled"
                        (click)="addToCart(c.id)"
                        *ngIf="!isEnrolled">
                  {{ isAddingToCart ? 'Adding...' : 'Add to Cart' }}
                </button>
                
                <div class="sidebar-card__error" *ngIf="enrollmentError">{{ enrollmentError }}</div>
                <div class="sidebar-card__success" *ngIf="enrollmentSuccess">{{ enrollmentSuccess }}</div>
                
                <p class="sidebar-card__enrolled-text">Join 1,250 students already enrolled</p>
              </div>
            </aside>
          </div>
        </ng-container>
      </div>
    </section>
  `,
  styles: `
    .course-description {
      font-size: 16px;
      line-height: 1.7;
      color: #374151;
      margin-top: 16px;
    }

    .curriculum-sections {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 20px;
    }

    .curriculum-section {
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #F9FAFB;
      border-bottom: 1px solid #E5E7EB;
    }

    .section-title-sm {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .lesson-count {
      font-size: 14px;
      color: #6B7280;
      font-weight: 500;
    }

    .section-lessons {
      padding: 12px;
    }

    .lesson-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .lesson-item:hover {
      background: #F9FAFB;
    }

    .lesson-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #F3F4F6;
      flex-shrink: 0;
    }

    .lesson-title {
      flex: 1;
      font-size: 15px;
      color: #374151;
      font-weight: 500;
    }

    .lesson-duration {
      font-size: 13px;
      color: #9CA3AF;
      font-weight: 500;
    }

    .empty-message {
      color: #6B7280;
      font-size: 15px;
      text-align: center;
      padding: 40px 20px;
      background: #F9FAFB;
      border-radius: 12px;
      margin-top: 20px;
    }

    // Live Sessions
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;
    }

    .session-card {
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      padding: 24px;
      transition: all 0.2s;

      &.session-live {
        border-color: #EF4444;
        background: linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%);
      }

      &.session-completed {
        opacity: 0.8;
      }

      &.session-cancelled {
        opacity: 0.6;
        background: #F9FAFB;
      }
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .session-number-badge {
      display: inline-block;
      padding: 6px 12px;
      background: #E0E7FF;
      color: #3730A3;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }

    .session-status-badge {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;

      &.status-scheduled {
        background: #DBEAFE;
        color: #1E40AF;
      }

      &.status-live {
        background: #FEE2E2;
        color: #991B1B;
        animation: pulse 2s ease-in-out infinite;
      }

      &.status-completed {
        background: #D1FAE5;
        color: #065F46;
      }

      &.status-cancelled {
        background: #F3F4F6;
        color: #6B7280;
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .session-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .session-description {
      color: #6B7280;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .session-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .session-detail-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #374151;
      font-size: 15px;

      svg {
        color: #6366F1;
        flex-shrink: 0;
      }
    }

    .session-actions {
      margin-top: 16px;
    }

    .btn-join-session {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.2s;
      border: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      &.btn-live {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        animation: pulse 2s ease-in-out infinite;

        &:hover {
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
      }
    }

    .btn-watch-recording {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
    }

    .enrollment-required {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: 8px;
      margin-top: 16px;

      svg {
        flex-shrink: 0;
      }

      span {
        color: #92400E;
        font-size: 14px;
        font-weight: 500;
      }
    }
  `
})
export class CourseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly http = inject(HttpClient);

  course$: Observable<Course> = this.route.paramMap.pipe(
    map(params => Number(params.get('id'))),
    switchMap(id => this.service.get(id)),
    tap(course => {
      console.log('Course loaded:', course);
      console.log('Course kind:', course.kind);
      console.log('Is LIVE course?', course.kind === 'LIVE');
      
      this.checkEnrollmentStatus(course.id);
      this.loadCurriculum(course.id);
      
      if (course.kind === 'LIVE') {
        console.log('Loading live sessions for LIVE course...');
        this.loadLiveSessions(course.id);
        // Subscribe immediately to trigger the HTTP call
        this.liveSessions$.subscribe();
      } else {
        console.log('Not a LIVE course, skipping session load');
      }
    })
  );

  curriculum$: Observable<CurriculumResponse | null> = of(null);
  liveSessions$: Observable<LiveSession[]> = of([]);
  
  activeTab: 'overview' | 'syllabus' | 'reviews' | 'schedule' = 'overview';
  isEnrolling = false;
  isEnrolled = false;
  isAddingToCart = false;
  enrollmentError = '';
  enrollmentSuccess = '';

  setActiveTab(tab: 'overview' | 'syllabus' | 'reviews' | 'schedule'): void {
    this.activeTab = tab;
  }

  loadCurriculum(courseId: number): void {
    this.curriculum$ = this.http.get<CurriculumResponse>(`/api/courses/${courseId}/curriculum`);
  }

  loadLiveSessions(courseId: number): void {
    console.log(`%c[LiveSessions] Loading sessions for course ${courseId}`, 'color: blue; font-weight: bold');
    console.log(`%c[LiveSessions] API endpoint: /api/courses/${courseId}/sessions`, 'color: blue');
    
    this.liveSessions$ = this.http.get<LiveSession[]>(`/api/courses/${courseId}/sessions`).pipe(
      tap({
        next: (sessions) => {
          console.log(`%c[LiveSessions] ✓ Successfully loaded ${sessions.length} sessions`, 'color: green; font-weight: bold');
          console.log('[LiveSessions] Sessions data:', sessions);
          if (sessions.length === 0) {
            console.warn('%c[LiveSessions] ⚠ No sessions found for this course', 'color: orange; font-weight: bold');
          }
        },
        error: (error) => {
          console.error('%c[LiveSessions] ✗ Error loading sessions:', 'color: red; font-weight: bold', error);
          console.error('[LiveSessions] Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url
          });
        }
      })
    );
  }

  checkEnrollmentStatus(courseId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.isEnrolled = false;
      return;
    }

    this.enrollmentService.isEnrolled(courseId).subscribe({
      next: (enrolled) => {
        this.isEnrolled = enrolled;
        console.log(`Enrollment status for course ${courseId}:`, enrolled);
      },
      error: (err) => {
        console.error('Error checking enrollment status:', err);
        this.isEnrolled = false;
      }
    });
  }

  enrollNow(courseId: number): void {
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      // Redirect to login with return URL
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/courses/${courseId}` }
      });
      return;
    }

    // Clear previous messages
    this.enrollmentError = '';
    this.enrollmentSuccess = '';
    this.isEnrolling = true;

    this.enrollmentService.enroll(courseId).subscribe({
      next: (response) => {
        console.log('Enrollment response:', response);
        this.isEnrolling = false;
        this.isEnrolled = true;
        this.enrollmentSuccess = 'Successfully enrolled! Check "My Courses" to access your content.';
      },
      error: (error) => {
        console.error('Enrollment error:', error);
        this.isEnrolling = false;
        if (error.status === 409) {
          // Already enrolled
          this.isEnrolled = true;
          const errorMsg = typeof error.error === 'string' ? error.error : error.error?.message;
          this.enrollmentError = errorMsg || 'You are already enrolled in this course.';
        } else if (error.status === 401 || error.status === 403) {
          // Unauthorized - redirect to login
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: `/courses/${courseId}` }
          });
        } else {
          const errorMsg = typeof error.error === 'string' ? error.error : error.error?.message;
          this.enrollmentError = errorMsg || 'Failed to enroll. Please try again.';
        }
      }
    });
  }

  addToCart(courseId: number): void {
    // No auth check needed - CartService handles both guest and authenticated users
    this.isAddingToCart = true;
    this.enrollmentError = '';
    this.enrollmentSuccess = '';
    
    this.cartService.addItem(courseId).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.enrollmentSuccess = 'Added to cart!';
        // Navigate to cart after a short delay to show success message
        setTimeout(() => {
          this.router.navigate(['/cart']);
        }, 500);
      },
      error: (error) => {
        this.isAddingToCart = false;
        if (error.status === 409) {
          // Already in cart or enrolled
          const errorMsg = typeof error.error === 'string' ? error.error : error.error?.message;
          this.enrollmentError = errorMsg || 'Already in cart or enrolled';
        } else {
          this.enrollmentError = 'Failed to add to cart. Please try again.';
        }
      }
    });
  }

  addToCartAndCheckout(courseId: number): void {
    // No auth check needed - users will be prompted to login at checkout if not authenticated
    this.isAddingToCart = true;
    this.enrollmentError = '';
    
    this.cartService.addItem(courseId).subscribe({
      next: () => {
        this.isAddingToCart = false;
        // Navigate directly to checkout (checkout page has auth guard)
        this.router.navigate(['/checkout']);
      },
      error: (error) => {
        this.isAddingToCart = false;
        if (error.status === 409) {
          // Already in cart or enrolled
          const errorMsg = typeof error.error === 'string' ? error.error : error.error?.message;
          this.enrollmentError = errorMsg || 'Already in cart or enrolled';
        } else {
          this.enrollmentError = 'Failed to add to cart. Please try again.';
        }
      }
    });
  }

  getEnrollButtonText(): string {
    if (this.isEnrolled) {
      return 'Already Enrolled';
    }
    if (this.isEnrolling) {
      return 'Enrolling...';
    }
    return 'Enroll Now';
  }
}


