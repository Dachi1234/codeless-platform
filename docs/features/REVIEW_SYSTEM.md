# ⭐ Course Review System

**Status**: ✅ Fully Implemented (Oct 10, 2025)  
**Version**: 1.0  
**Database Migration**: V18

---

## Overview

The Course Review System allows students who have purchased a course to leave star ratings (1-5) and optional text reviews. Reviews are displayed on the course detail page with pagination, and the system automatically calculates and updates the course's average rating.

---

## Features

### ✅ **Core Functionality**
- Star rating (1-5 stars)
- Optional text review (unlimited length)
- One review per user per course (can edit/update)
- Delete own review
- Paginated review list
- Average rating display
- User avatars (name initials)
- Formatted dates

### ✅ **Security & Validation**
- Only enrolled/purchased users can review
- Users can only edit/delete their own reviews
- Rating validation (must be 1-5)
- Enrollment check before submission

### ✅ **Automatic Updates**
- Course average rating updated on submit/update/delete
- Review count updated automatically
- Real-time display on course cards

---

## Architecture

### **Database Schema**

```sql
-- course_reviews table
CREATE TABLE course_reviews (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, user_id) -- One review per user per course
);

-- Indexes for performance
CREATE INDEX idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX idx_course_reviews_rating ON course_reviews(rating);

-- Uses existing columns in courses table
-- course.rating (average rating)
-- course.review_count (total reviews)
```

---

## Backend API

### **Endpoints**

#### 1. Get Course Reviews (Public)
```http
GET /api/courses/{courseId}/reviews?page=0&size=10
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "courseId": 5,
      "userId": 10,
      "userName": "John Doe",
      "rating": 5,
      "reviewText": "Excellent course! Learned a lot.",
      "createdAt": "2025-10-10T20:30:00Z",
      "updatedAt": "2025-10-10T20:30:00Z"
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "number": 0
}
```

---

#### 2. Get My Review (Authenticated)
```http
GET /api/courses/{courseId}/reviews/me
Authorization: Bearer {token}
```

**Response (if review exists):**
```json
{
  "id": 1,
  "courseId": 5,
  "userId": 10,
  "userName": "John Doe",
  "rating": 5,
  "reviewText": "Excellent course!",
  "createdAt": "2025-10-10T20:30:00Z",
  "updatedAt": "2025-10-10T20:30:00Z"
}
```

**Response (no review):** `204 No Content`

---

#### 3. Submit/Update Review (Authenticated + Enrolled)
```http
POST /api/courses/{courseId}/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "reviewText": "Great course! Highly recommend."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "review": {
    "id": 1,
    "courseId": 5,
    "rating": 5,
    "reviewText": "Great course!",
    "createdAt": "2025-10-10T20:30:00Z"
  }
}
```

**Errors:**
- `403 Forbidden` - User has not purchased this course
- `400 Bad Request` - Invalid rating (not 1-5)
- `401 Unauthorized` - Not logged in

---

#### 4. Delete Review (Authenticated + Owner)
```http
DELETE /api/courses/{courseId}/reviews/{reviewId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Errors:**
- `403 Forbidden` - Not your review
- `404 Not Found` - Review doesn't exist

---

## Backend Implementation

### **Files Structure**

```
backend/codeless-backend/src/main/java/com/codeless/backend/
├── domain/
│   └── CourseReview.java              # JPA Entity
├── repository/
│   └── CourseReviewRepository.java    # Data access layer
├── service/
│   └── CourseReviewService.java       # Business logic
└── web/api/
    └── CourseReviewController.java    # REST API
```

### **Key Classes**

#### **CourseReview Entity**
```java
@Entity
@Table(name = "course_reviews")
public class CourseReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @Column(nullable = false)
    private Integer rating; // 1-5

    @Column(columnDefinition = "TEXT")
    private String reviewText;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
```

#### **CourseReviewService**
- `submitReview()` - Create or update review
- `getCourseReviews()` - Paginated list
- `getUserReview()` - Get user's review
- `deleteReview()` - Delete own review
- `updateCourseRating()` - Recalculate average

---

## Frontend Implementation

### **Component Structure**

```
frontend/src/app/components/
└── course-reviews/
    └── course-reviews.component.ts    # Standalone component
```

### **CourseReviewsComponent**

**Inputs:**
- `@Input() courseId: number` - Course to show reviews for
- `@Input() canReview: boolean` - Whether user can leave a review (enrolled)
- `@Input() averageRating: number` - Course average rating

**Features:**
- Write/edit review section (if enrolled)
- Star rating selector (interactive)
- Text input for review
- Submit/Update/Delete buttons
- Paginated review list
- User avatars (name initials)
- Empty state handling
- Loading states

### **Integration Example**

```typescript
// course-detail.component.ts
<app-course-reviews 
  [courseId]="course.id" 
  [canReview]="isEnrolled || false" 
  [averageRating]="course.rating || 0">
</app-course-reviews>
```

---

## User Flow

### **1. Student Purchases Course**
- Enrollment created in database
- User can now access course content

### **2. Student Navigates to Course Detail**
- Clicks "Reviews" tab
- Sees existing reviews from other students

### **3. If Enrolled: Write Review**
- "Write a Review" form appears
- Selects 1-5 stars (required)
- Optionally writes text review
- Clicks "Submit Review"

### **4. Backend Processing**
- Validates user is enrolled
- Validates rating (1-5)
- Saves review to database
- Recalculates course average rating
- Updates `course.rating` and `course.review_count`

### **5. Review Appears**
- User's review appears at top of list
- Can edit or delete anytime
- Other users see the review

---

## Business Rules

### **Who Can Review?**
✅ Users who have purchased/enrolled in the course  
❌ Non-enrolled users (button hidden)  
❌ Course instructors (future: separate instructor response feature)

### **Review Limitations**
- One review per user per course
- Can update existing review anytime
- Can delete own review anytime
- Cannot delete other users' reviews

### **Rating Calculation**
- Average = SUM(all ratings) / COUNT(reviews)
- Rounded to 2 decimal places (e.g., 4.73)
- Displayed as stars (whole + partial)

---

## Testing

### **Manual Testing Steps**

1. **As Non-Enrolled User:**
   - Visit course detail page
   - Click "Reviews" tab
   - Should NOT see "Write a Review" form
   - Should see existing reviews from others

2. **As Enrolled User:**
   - Purchase a course
   - Go to course detail → Reviews tab
   - Should see "Write a Review" form
   - Select 3 stars
   - Write: "Good course, could be better"
   - Click "Submit Review"
   - Should see success message
   - Review appears at top

3. **Edit Review:**
   - Change to 5 stars
   - Update text: "Actually amazing!"
   - Click "Update Review"
   - Changes saved

4. **Delete Review:**
   - Click "Delete Review"
   - Confirm dialog
   - Review removed
   - Average rating updated

5. **Pagination:**
   - If > 5 reviews, "Next" button appears
   - Click "Next" to see more reviews
   - "Previous" navigates back

---

## Performance Considerations

### **Database Indexes**
- `course_id` - Fast lookups by course
- `user_id` - Fast lookups by user
- `rating` - Fast average calculations

### **Pagination**
- Default page size: 5 reviews
- Configurable via query parameter
- Reduces initial load time

### **Lazy Loading**
- `Course` and `User` relationships fetched lazily
- Only loaded when needed

---

## Future Enhancements

### **Planned Features**
- [ ] Review moderation (admin approval)
- [ ] Report inappropriate reviews
- [ ] "Helpful" voting system
- [ ] Instructor responses to reviews
- [ ] Review filtering (by rating, date)
- [ ] Sort reviews (most helpful, newest, highest rating)
- [ ] Review images/attachments
- [ ] Verified purchase badge

### **Analytics**
- [ ] Review sentiment analysis
- [ ] Review trend charts
- [ ] Most reviewed courses
- [ ] Average ratings by category

---

## Troubleshooting

### **"You must purchase this course" Error**
**Cause**: User not enrolled in course  
**Solution**: Purchase the course first

### **Review Not Appearing**
**Cause**: Pagination, or filter active  
**Solution**: Check page number, refresh

### **Can't Delete Review**
**Cause**: Not the review owner  
**Solution**: Only own reviews can be deleted

### **Average Rating Not Updating**
**Cause**: Cache or database issue  
**Solution**: Check `updateCourseRating()` method, verify DB connection

---

## API Documentation

Full Swagger documentation available at:
```
http://localhost:8080/swagger-ui.html
```

Look for: **"Course Reviews"** tag

---

## Migration Guide

### **Run Migration V18**

**For Neon (Production):**
```sql
-- Run in Neon SQL Editor
-- File: V18__add_course_reviews.sql
```

**For Local PostgreSQL:**
```bash
# If Flyway enabled:
mvn flyway:migrate

# If Flyway disabled:
# Run SQL manually in pgAdmin
```

---

## Related Documentation

- [CURRENT_STATUS.md](../../CURRENT_STATUS.md) - Overall project status
- [QUIZ_SYSTEM.md](./QUIZ_SYSTEM.md) - Quiz functionality
- [PROGRESS_TRACKING.md](./PROGRESS_TRACKING.md) - Progress tracking
- [API Documentation](http://localhost:8080/swagger-ui.html) - Swagger UI

---

**Last Updated**: October 10, 2025  
**Author**: AI Assistant  
**Version**: 1.0

