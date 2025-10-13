import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Course, CourseService, PageResponse } from '../../services/course.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
            <button *ngIf="searchTerm" class="search-clear-btn" (click)="clearFilter('search')" title="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <div class="filter-with-clear">
            <select class="filter-select" [(ngModel)]="selectedCategory" (ngModelChange)="fetch()">
              <option value="">All Categories</option>
              <option *ngFor="let cat of (categories$ | async)" [value]="cat">{{ cat }}</option>
            </select>
            <button *ngIf="selectedCategory" class="filter-clear-btn" (click)="clearFilter('category')" title="Clear category filter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="filter-with-clear">
            <select class="filter-select" [(ngModel)]="selectedLevel" (ngModelChange)="fetch()">
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <button *ngIf="selectedLevel" class="filter-clear-btn" (click)="clearFilter('level')" title="Clear level filter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="filter-with-clear">
            <select class="filter-select" [(ngModel)]="selectedType" (ngModelChange)="fetch()">
              <option value="">All Types</option>
              <option value="PRE_RECORDED">Recorded</option>
              <option value="LIVE">Live</option>
              <option value="BUNDLE">Bundle</option>
            </select>
            <button *ngIf="selectedType" class="filter-clear-btn" (click)="clearFilter('type')" title="Clear type filter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="sort-wrapper">
            <svg class="sort-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7h18M6 12h12M9 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="sort-label">Sort:</span>
            <select class="sort-select" [(ngModel)]="sortBy" (ngModelChange)="fetch()">
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
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
  styles: `
    /* Filter wrapper with clear button */
    .filter-with-clear {
      position: relative;
      display: inline-block;
    }

    /* Stylish clear button for filters */
    .filter-clear-btn {
      position: absolute;
      right: 32px; /* Position before dropdown arrow */
      top: 50%;
      transform: translateY(-50%);
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      padding: 0;
      cursor: pointer;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      z-index: 10;
      opacity: 0;
      animation: fadeIn 0.2s ease forwards;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateY(-50%) scale(1);
      }
    }

    .filter-clear-btn:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    }

    .filter-clear-btn:active {
      transform: translateY(-50%) scale(0.95);
    }

    .filter-clear-btn svg {
      width: 10px;
      height: 10px;
    }

    /* Search input styling */
    .search-input {
      position: relative;
    }

    .search-clear-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 50%;
      width: 22px;
      height: 22px;
      padding: 0;
      cursor: pointer;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      opacity: 0;
      animation: fadeIn 0.2s ease forwards;
    }

    .search-clear-btn:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    }

    .search-clear-btn:active {
      transform: translateY(-50%) scale(0.95);
    }

    .search-clear-btn svg {
      width: 12px;
      height: 12px;
    }

    /* Adjust select padding and width to make room for clear button */
    .filter-with-clear .filter-select {
      padding-right: 60px; /* More space for clear button + dropdown arrow */
      min-width: 180px; /* Consistent minimum width for all filters */
    }

    /* Ensure all filter wrappers have consistent width */
    .filter-with-clear {
      min-width: 180px;
    }

    /* Smooth focus states */
    .filter-with-clear .filter-select:focus {
      outline: 2px solid rgba(90, 141, 238, 0.3);
      outline-offset: 2px;
    }

    /* Sort dropdown - visually distinct from filters */
    .sort-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, rgba(90, 141, 238, 0.08) 0%, rgba(90, 141, 238, 0.12) 100%);
      border: 1.5px solid rgba(90, 141, 238, 0.25);
      border-radius: 8px;
      padding: 8px 14px;
      transition: all 0.2s ease;
    }

    .sort-wrapper:hover {
      border-color: rgba(90, 141, 238, 0.4);
      background: linear-gradient(135deg, rgba(90, 141, 238, 0.12) 0%, rgba(90, 141, 238, 0.16) 100%);
      box-shadow: 0 2px 8px rgba(90, 141, 238, 0.15);
    }

    .sort-icon {
      color: var(--primary-600, #5a8dee);
      flex-shrink: 0;
    }

    .sort-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-700, #4a7ddd);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .sort-select {
      background: white;
      border: 1.5px solid rgba(90, 141, 238, 0.2);
      border-radius: 6px;
      padding: 6px 28px 6px 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--neutral-800);
      cursor: pointer;
      outline: none;
      min-width: 160px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a8dee' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      appearance: none;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .sort-select:hover {
      border-color: rgba(90, 141, 238, 0.4);
      box-shadow: 0 2px 6px rgba(90, 141, 238, 0.15);
    }

    .sort-select:focus {
      outline: none;
      border-color: var(--primary-600, #5a8dee);
      box-shadow: 0 0 0 3px rgba(90, 141, 238, 0.15);
    }

    .sort-select option {
      background: white;
      color: var(--neutral-800);
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.15s ease;
    }

    .sort-select option:hover {
      background: linear-gradient(135deg, rgba(90, 141, 238, 0.08) 0%, rgba(90, 141, 238, 0.12) 100%);
      color: var(--primary-700, #4a7ddd);
    }

    .sort-select option:checked {
      background: linear-gradient(135deg, rgba(90, 141, 238, 0.15) 0%, rgba(90, 141, 238, 0.2) 100%);
      color: var(--primary-700, #4a7ddd);
      font-weight: 600;
    }

    .sort-select option:last-child {
      border-bottom: none;
    }
  `
})
export class CoursesComponent implements OnInit {
  private readonly service = inject(CourseService);
  
  courses$!: Observable<Course[] | null>; // Extracted courses from page response
  categories$!: Observable<string[]>; // Dynamic categories from backend
  private isInitializing = true; // Block ngModelChange during component init

  searchTerm = '';
  selectedCategory = '';
  selectedLevel = '';
  selectedType = '';
  sortBy = 'popular';
  
  totalCourses = 0;
  displayedCourses = 0;

  ngOnInit(): void {
    // Fetch categories from backend
    this.categories$ = this.service.getCategories();
    
    // Fetch initial data with all default values
    this.fetchCourses();
    
    // Allow subsequent user-triggered changes after 200ms
    setTimeout(() => {
      this.isInitializing = false;
    }, 200);
  }

  hasFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategory || this.selectedLevel || this.selectedType);
  }

  clearFilter(filterType: 'search' | 'category' | 'level' | 'type'): void {
    switch (filterType) {
      case 'search':
        this.searchTerm = '';
        break;
      case 'category':
        this.selectedCategory = '';
        break;
      case 'level':
        this.selectedLevel = '';
        break;
      case 'type':
        this.selectedType = '';
        break;
    }
    this.fetch();
  }

  fetch(): void {
    // Block all calls during component initialization
    if (this.isInitializing) {
      return;
    }
    this.fetchCourses();
  }

  private fetchCourses(): void {
    const pageResponse$ = this.service.list({
      q: this.searchTerm || undefined,
      kind: this.selectedType || undefined,
      category: this.selectedCategory || undefined,
      level: this.selectedLevel || undefined,
      sort: this.mapSort(this.sortBy)
    });

    // Subscribe to update counts
    pageResponse$.subscribe(response => {
      this.totalCourses = response.totalElements;
      this.displayedCourses = response.content.length;
    });

    // Extract courses for template
    this.courses$ = pageResponse$.pipe(
      map(response => response.content)
    );
  }

  private mapSort(s: string): string | undefined {
    switch (s) {
      case 'popular': return 'rating,desc'; // Sort by rating score (highest first)
      case 'newest': return 'createdAt,desc';
      case 'price-low': return 'price,asc';
      case 'price-high': return 'price,desc';
      default: return undefined;
    }
  }
}
