import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewPage {
  content: Review[];
  totalElements: number;
  totalPages: number;
  number: number;
}

@Component({
  selector: 'app-course-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reviews-container">
      <!-- Write Review Section (if user is enrolled) -->
      @if (authService.isAuthenticated() && canReview) {
        <div class="write-review">
          <h3>{{ myReview ? 'Edit Your Review' : 'Write a Review' }}</h3>
          
          <div class="rating-input">
            <label>Your Rating:</label>
            <div class="stars">
              @for (star of [1, 2, 3, 4, 5]; track star) {
                <button 
                  type="button"
                  class="star-btn"
                  [class.active]="star <= newRating"
                  (click)="newRating = star">
                  ★
                </button>
              }
            </div>
          </div>

          <div class="review-input">
            <label for="reviewText">Your Review (optional):</label>
            <textarea 
              id="reviewText" 
              [(ngModel)]="newReviewText" 
              placeholder="Share your experience with this course..."
              rows="4">
            </textarea>
          </div>

          <div class="review-actions">
            @if (myReview) {
              <button class="btn-delete" (click)="deleteReview()" [disabled]="submitting">
                Delete Review
              </button>
            }
            <button class="btn-submit" (click)="submitReview()" [disabled]="submitting || newRating === 0">
              {{ submitting ? 'Submitting...' : (myReview ? 'Update Review' : 'Submit Review') }}
            </button>
          </div>
        </div>
      }

      <!-- Reviews List -->
      <div class="reviews-list">
        <div class="reviews-header">
          <h3>Reviews ({{ totalReviews }})</h3>
          @if (averageRating > 0) {
            <div class="average-rating">
              <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
              <div class="stars-display">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <span class="star" [class.filled]="star <= Math.floor(averageRating)">★</span>
                }
              </div>
            </div>
          }
        </div>

        @if (loading) {
          <div class="loading">Loading reviews...</div>
        }

        @if (!loading && reviews.length === 0) {
          <div class="empty-state">
            <p>No reviews yet. Be the first to review this course!</p>
          </div>
        }

        @if (!loading && reviews.length > 0) {
          <div class="review-items">
            @for (review of reviews; track review.id) {
              <div class="review-item">
                <div class="review-header">
                  <div class="user-info">
                    <div class="user-avatar">{{ getInitials(review.userName) }}</div>
                    <div>
                      <div class="user-name">{{ review.userName }}</div>
                      <div class="review-date">{{ formatDate(review.createdAt) }}</div>
                    </div>
                  </div>
                  <div class="review-rating">
                    @for (star of [1, 2, 3, 4, 5]; track star) {
                      <span class="star" [class.filled]="star <= review.rating">★</span>
                    }
                  </div>
                </div>
                @if (review.reviewText) {
                  <p class="review-text">{{ review.reviewText }}</p>
                }
              </div>
            }
          </div>

          @if (totalPages > 1) {
            <div class="pagination">
              <button 
                class="btn-page" 
                (click)="loadPage(currentPage - 1)" 
                [disabled]="currentPage === 0">
                Previous
              </button>
              <span class="page-info">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
              <button 
                class="btn-page" 
                (click)="loadPage(currentPage + 1)" 
                [disabled]="currentPage >= totalPages - 1">
                Next
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .reviews-container {
      margin-top: 40px;
    }

    .write-review {
      background: #F9FAFB;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
    }

    .write-review h3 {
      font-size: 20px;
      font-weight: 600;
      color: #1F2937;
      margin: 0 0 20px 0;
    }

    .rating-input {
      margin-bottom: 20px;
    }

    .rating-input label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .stars {
      display: flex;
      gap: 8px;
    }

    .star-btn {
      background: none;
      border: none;
      font-size: 32px;
      color: #D1D5DB;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
    }

    .star-btn:hover,
    .star-btn.active {
      color: #FCD34D;
    }

    .review-input label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .review-input textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-family: inherit;
      font-size: 15px;
      resize: vertical;
    }

    .review-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .btn-submit, .btn-delete {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-submit {
      background: #5A8DEE;
      color: white;
    }

    .btn-submit:hover:not(:disabled) {
      background: #4F46E5;
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-delete {
      background: #EF4444;
      color: white;
    }

    .btn-delete:hover:not(:disabled) {
      background: #DC2626;
    }

    .reviews-list {
      background: white;
    }

    .reviews-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #E5E7EB;
    }

    .reviews-header h3 {
      font-size: 24px;
      font-weight: 600;
      color: #1F2937;
      margin: 0;
    }

    .average-rating {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .rating-value {
      font-size: 32px;
      font-weight: 700;
      color: #1F2937;
    }

    .stars-display {
      display: flex;
      gap: 4px;
    }

    .stars-display .star {
      font-size: 20px;
      color: #D1D5DB;
    }

    .stars-display .star.filled {
      color: #FCD34D;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      color: #6B7280;
    }

    .review-items {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .review-item {
      padding-bottom: 24px;
      border-bottom: 1px solid #E5E7EB;
    }

    .review-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .user-info {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #5A8DEE;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
    }

    .user-name {
      font-weight: 600;
      color: #1F2937;
      font-size: 16px;
    }

    .review-date {
      font-size: 14px;
      color: #6B7280;
      margin-top: 2px;
    }

    .review-rating {
      display: flex;
      gap: 4px;
    }

    .review-rating .star {
      font-size: 18px;
      color: #D1D5DB;
    }

    .review-rating .star.filled {
      color: #FCD34D;
    }

    .review-text {
      color: #374151;
      line-height: 1.6;
      margin: 0;
      font-size: 15px;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 32px;
    }

    .btn-page {
      padding: 8px 16px;
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-page:hover:not(:disabled) {
      border-color: #5A8DEE;
      color: #5A8DEE;
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 14px;
      color: #6B7280;
    }
  `]
})
export class CourseReviewsComponent implements OnInit {
  @Input() courseId!: number;
  @Input() canReview: boolean = false; // Set to true if user has purchased course
  @Input() averageRating: number = 0;

  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly Math = Math;

  reviews: Review[] = [];
  myReview: Review | null = null;
  loading = false;
  submitting = false;
  currentPage = 0;
  totalPages = 0;
  totalReviews = 0;

  newRating = 0;
  newReviewText = '';

  ngOnInit(): void {
    this.loadReviews();
    if (this.authService.isAuthenticated()) {
      this.loadMyReview();
    }
  }

  loadReviews(page: number = 0): void {
    this.loading = true;
    this.http.get<ReviewPage>(`/api/courses/${this.courseId}/reviews?page=${page}&size=5`)
      .subscribe({
        next: (data) => {
          this.reviews = data.content;
          this.currentPage = data.number;
          this.totalPages = data.totalPages;
          this.totalReviews = data.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading reviews:', err);
          this.loading = false;
        }
      });
  }

  loadMyReview(): void {
    this.http.get<Review>(`/api/courses/${this.courseId}/reviews/me`)
      .subscribe({
        next: (review) => {
          this.myReview = review;
          this.newRating = review.rating;
          this.newReviewText = review.reviewText || '';
        },
        error: (err) => {
          // 204 means no review yet, which is fine
          if (err.status !== 204) {
            console.error('Error loading my review:', err);
          }
        }
      });
  }

  submitReview(): void {
    if (this.newRating === 0) return;

    this.submitting = true;
    this.http.post<any>(`/api/courses/${this.courseId}/reviews`, {
      rating: this.newRating,
      reviewText: this.newReviewText
    }).subscribe({
      next: (response) => {
        this.submitting = false;
        alert('Review submitted successfully!');
        this.myReview = response.review;
        this.loadReviews(0); // Reload reviews
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.submitting = false;
        alert('Failed to submit review: ' + (err.error?.error || err.message));
      }
    });
  }

  deleteReview(): void {
    if (!this.myReview || !confirm('Are you sure you want to delete your review?')) {
      return;
    }

    this.submitting = true;
    this.http.delete(`/api/courses/${this.courseId}/reviews/${this.myReview.id}`)
      .subscribe({
        next: () => {
          this.submitting = false;
          alert('Review deleted successfully');
          this.myReview = null;
          this.newRating = 0;
          this.newReviewText = '';
          this.loadReviews(0);
        },
        error: (err) => {
          console.error('Error deleting review:', err);
          this.submitting = false;
          alert('Failed to delete review');
        }
      });
  }

  loadPage(page: number): void {
    this.loadReviews(page);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

