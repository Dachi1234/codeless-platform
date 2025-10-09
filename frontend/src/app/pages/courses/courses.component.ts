import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Course, CourseService } from '../../services/course.service';
import { Observable } from 'rxjs';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-courses',
  imports: [NgFor, NgIf, AsyncPipe, CourseCardComponent, FormsModule],
  template: `
    <section class="courses-page">
      <div class="container">
        <!-- Page Header -->
        <div class="courses-page__header">
          <h1 class="h-1">All Courses</h1>
          <p class="courses-page__subtitle">Discover {{ totalCourses }} courses to advance your skills</p>
        </div>

        <!-- Search & Filters Bar -->
        <div class="courses-page__filters">
          <div class="search-input">
            <svg class="search-input__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
              <path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input type="text" placeholder="Search courses..." [(ngModel)]="searchTerm" (ngModelChange)="fetch()">
          </div>
          
          <select class="filter-select" [(ngModel)]="selectedCategory" (ngModelChange)="fetch()">
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Marketing">Marketing</option>
            <option value="Data Science">Data Science</option>
            <option value="Development">Development</option>
          </select>

          <select class="filter-select" [(ngModel)]="selectedLevel" (ngModelChange)="fetch()">
            <option value="">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <select class="filter-select" [(ngModel)]="selectedType" (ngModelChange)="fetch()">
            <option value="">All Types</option>
            <option value="PRE_RECORDED">Recorded</option>
            <option value="LIVE">Live</option>
            <option value="BUNDLE">Bundle</option>
          </select>

          <select class="filter-select" [(ngModel)]="sortBy" (ngModelChange)="fetch()">
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <!-- Results Info -->
        <div class="courses-page__results-info">
          <span class="courses-page__count">Showing {{ displayedCourses }} of {{ totalCourses }} courses</span>
          <span class="courses-page__filter-applied" *ngIf="hasFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Filter applied
          </span>
        </div>

        <!-- Loading/Empty States -->
        <div *ngIf="(courses$ | async) === null" class="courses-page__loading">Loading courses…</div>
        <div *ngIf="(courses$ | async)?.length === 0" class="courses-page__empty">No courses found.</div>

        <!-- Course Cards Grid -->
        <div class="courses-page__grid">
          <app-course-card *ngFor="let c of (courses$ | async)" [course]="c"></app-course-card>
        </div>
      </div>
    </section>
  `,
  styles: ``
})
export class CoursesComponent {
  private readonly service = inject(CourseService);
  courses$: Observable<Course[] | null> = this.service.list();

  searchTerm = '';
  selectedCategory = '';
  selectedLevel = '';
  selectedType = '';
  sortBy = 'popular';
  
  totalCourses = 4;
  displayedCourses = 4;

  hasFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategory || this.selectedLevel || this.selectedType);
  }

  fetch(): void {
    this.courses$ = this.service.list({
      q: this.searchTerm || undefined,
      kind: this.selectedType || undefined,
      category: this.selectedCategory || undefined,
      level: this.selectedLevel || undefined,
      sort: this.mapSort(this.sortBy)
    });
  }

  private mapSort(s: string): string | undefined {
    switch (s) {
      case 'newest': return 'createdAt,desc';
      case 'price-low': return 'price,asc';
      case 'price-high': return 'price,desc';
      default: return undefined;
    }
  }
}
