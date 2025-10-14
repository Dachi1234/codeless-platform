import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe, NgFor } from '@angular/common';
import { Course, CourseService } from '../../services/course.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { UpcomingCardComponent } from '../../components/upcoming-card/upcoming-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor, AsyncPipe, CourseCardComponent, UpcomingCardComponent],
  template: `
    <!-- Hero Section - Full Width -->
    <section class="hero">
      <div class="hero__shape hero__shape--mint"></div>
      <div class="hero__shape hero__shape--coral"></div>

      <div class="hero__content">
        <div class="brandbar">
          <span class="brandbar__line"></span>
          <img src="/logo-icon.png" alt="Codeless" class="brandbar__icon">
          <span class="brandbar__line"></span>
        </div>
        
        <h1 class="h-hero">CODELESS</h1>

        <p class="lead hero__tagline">
          We keep it fun, we keep it smart. CodeLess offers engaging, insightful courses delivered in a friendly, approachable style.
        </p>

        <a routerLink="/courses" class="hero__cta">
          Buy a course today
        </a>
      </div>
    </section>

    <!-- Stats section -->
    <section class="container stats">
      <div class="stats__grid">
        <div>
          <div class="stats__num">50,000+</div>
          <div class="stats__label">Students Enrolled</div>
        </div>
        <div>
          <div class="stats__num">500+</div>
          <div class="stats__label">Courses Available</div>
        </div>
        <div>
          <div class="stats__num">95%</div>
          <div class="stats__label">Completion Rate</div>
        </div>
      </div>
    </section>

    <!-- Featured courses preview -->
    <section class="featured">
      <div class="container">
        <div class="featured__header">
          <h2 class="h-1">Featured Courses</h2>
          <a routerLink="/courses" class="featured__view">View All Courses</a>
        </div>
        <div class="cards">
          <app-course-card *ngFor="let c of (featured$ | async)" [course]="c"></app-course-card>
        </div>
      </div>
    </section>

    <!-- Upcoming Live Courses -->
    <section class="upcoming">
      <div class="container">
        <div class="upcoming__header">
          <h2 class="h-1">Upcoming Live Courses</h2>
          <a routerLink="/courses" class="upcoming__view">View All Live Courses</a>
        </div>
        
        @if (upcomingLive$ | async; as liveCourses) {
          @if (liveCourses.length > 0) {
            <div class="cards">
              <app-course-card *ngFor="let c of liveCourses" [course]="c"></app-course-card>
            </div>
          } @else {
            <div class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3>No Upcoming Live Courses</h3>
              <p>Check back soon for new live sessions and workshops!</p>
              <a routerLink="/courses" class="btn-primary">Browse All Courses</a>
            </div>
          }
        }
      </div>
    </section>
  `,
  styles: `
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #F9FAFB;
      border-radius: 16px;
      margin-top: 20px;
    }

    .empty-state svg {
      margin: 0 auto 20px;
      display: block;
    }

    .empty-state h3 {
      font-size: 24px;
      font-weight: 600;
      color: #1F2937;
      margin: 0 0 12px 0;
    }

    .empty-state p {
      font-size: 16px;
      color: #6B7280;
      margin: 0 0 24px 0;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      padding: 12px 24px;
      background: #5A8DEE;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-primary:hover {
      background: #4F46E5;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(90, 141, 238, 0.3);
    }
  `
})
export class HomeComponent {
  private readonly service = inject(CourseService);
  
  featured$: Observable<Course[]> = this.service.list().pipe(
    map(response => response.content.slice(0, 3))
  );

  upcomingLive$: Observable<Course[]> = this.service.list().pipe(
    map(response => response.content.filter(c => c.kind === 'LIVE').slice(0, 3))
  );
}
