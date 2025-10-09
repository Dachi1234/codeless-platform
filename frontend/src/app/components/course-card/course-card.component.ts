import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Course } from '../../services/course.service';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, NgIf],
  template: `
    <div class="card" *ngIf="course">
      <div class="card__media">
        <img [src]="course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop'" 
             [alt]="course.title" 
             class="card__image">
        <div class="card__badge" [class.card__badge--live]="course.kind === 'LIVE'">
          {{ course.kind }}
        </div>
        <div class="card__spots" *ngIf="course.kind === 'LIVE' && course.maxStudents && course.enrolledCount">
          {{ course.maxStudents - course.enrolledCount }} spots left
        </div>
      </div>
      <div class="card__body">
        <h3 class="card__title">{{ course.title }}</h3>
        <p class="card__desc">{{ course.description || 'Learn essential skills from industry experts' }}</p>
        
        <div class="card__instructor">
          <span>{{ course.instructorName || 'TBD' }}</span>
          <span class="card__level-badge">{{ course.level || 'All Levels' }}</span>
        </div>

        <div class="card__meta">
          <span class="card__rating" *ngIf="course.rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD95A" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {{ course.rating }} <span *ngIf="course.reviewCount">({{ course.reviewCount }})</span>
          </span>
          <span class="card__students">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ course.enrolledCount || 0 }} students
          </span>
          <span class="card__duration">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ course.durationHours ? course.durationHours + ' hours' : (course.kind === 'LIVE' ? (course.sessionCount + ' sessions') : 'Self-paced') }}
          </span>
        </div>

        <div class="card__start-date" *ngIf="course.kind === 'LIVE' && course.startDate">
          Starts: {{ course.startDate | date:'M/d/yyyy' }}
        </div>

        <div class="card__footer">
          <div class="card__price-section">
            <div class="card__price-row">
              <div class="card__price">{{ course.price | currency:'USD':'symbol':'1.0-0' }}</div>
              <div class="card__price-old" *ngIf="course.originalPrice && course.originalPrice > course.price">
                {{ course.originalPrice | currency:'USD':'symbol':'1.0-0' }}
              </div>
            </div>
            <div class="card__category">{{ course.category || 'General' }}</div>
          </div>
          <div class="card__actions">
            <a [routerLink]="isEnrolled ? ['/courses', course.id, 'learn'] : ['/courses', course.id]" 
               class="btn-card btn-card--primary">
              <span *ngIf="isEnrolled">Continue Learning</span>
              <span *ngIf="!isEnrolled && course.kind === 'LIVE'">Enroll Now</span>
              <span *ngIf="!isEnrolled && course.kind !== 'LIVE'">View Details</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CourseCardComponent {
  @Input() course: Course | undefined;
  @Input() isEnrolled = false; // If true, link to /learn instead of /courses/:id
}


