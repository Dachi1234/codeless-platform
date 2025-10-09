import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Course, CourseService } from '../../services/course.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [NgIf, RouterLink, AsyncPipe, CurrencyPipe, DatePipe],
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
                <button class="tab" [class.tab--active]="activeTab === 'schedule'" (click)="setActiveTab('schedule')">Schedule</button>
              </div>

              <!-- Tab Content -->
              <div class="tab-content">
                <!-- Overview Tab -->
                <div class="course-detail__learn-section" *ngIf="activeTab === 'overview'">
                  <h2 class="section-title">What you'll learn</h2>
                  <div class="learn-grid">
                    <div class="learn-item">
                      <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>SEO & Keyword Research</span>
                    </div>
                    <div class="learn-item">
                      <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>Social Media Marketing</span>
                    </div>
                    <div class="learn-item">
                      <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>Pay-Per-Click Advertising</span>
                    </div>
                    <div class="learn-item">
                      <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>Content Marketing Strategy</span>
                    </div>
                    <div class="learn-item">
                      <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>Email Marketing Automation</span>
                    </div>
                    <div class="learn-item">
                      <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="#4ECB71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>Analytics & Performance Tracking</span>
                    </div>
                  </div>
                </div>

                <!-- Syllabus Tab -->
                <div class="course-detail__content-section" *ngIf="activeTab === 'syllabus'">
                  <h2 class="section-title">Course Syllabus</h2>
                  <p>Detailed syllabus content will be available soon. This section will include module breakdowns, lesson plans, and learning objectives.</p>
                </div>

                <!-- Reviews Tab -->
                <div class="course-detail__content-section" *ngIf="activeTab === 'reviews'">
                  <h2 class="section-title">Student Reviews</h2>
                  <p>Student reviews and testimonials will appear here. You'll be able to see ratings, feedback, and success stories from past students.</p>
                </div>

                <!-- Schedule Tab -->
                <div class="course-detail__content-section" *ngIf="activeTab === 'schedule'">
                  <h2 class="section-title">Course Schedule</h2>
                  <p>Live session schedule, office hours, and important dates will be listed here for enrolled students.</p>
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
  styles: ``
})
export class CourseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  course$: Observable<Course> = this.route.paramMap.pipe(
    map(params => Number(params.get('id'))),
    switchMap(id => this.service.get(id)),
    tap(course => this.checkEnrollmentStatus(course.id))
  );

  activeTab: 'overview' | 'syllabus' | 'reviews' | 'schedule' = 'overview';
  isEnrolling = false;
  isEnrolled = false;
  isAddingToCart = false;
  enrollmentError = '';
  enrollmentSuccess = '';

  setActiveTab(tab: 'overview' | 'syllabus' | 'reviews' | 'schedule'): void {
    this.activeTab = tab;
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
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/courses/${courseId}` }
      });
      return;
    }

    this.isAddingToCart = true;
    this.enrollmentError = '';
    
    this.cartService.addItem(courseId).subscribe({
      next: () => {
        this.isAddingToCart = false;
        // Navigate to cart
        this.router.navigate(['/cart']);
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
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/courses/${courseId}` }
      });
      return;
    }

    this.isAddingToCart = true;
    this.enrollmentError = '';
    
    this.cartService.addItem(courseId).subscribe({
      next: () => {
        this.isAddingToCart = false;
        // Navigate directly to checkout
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


