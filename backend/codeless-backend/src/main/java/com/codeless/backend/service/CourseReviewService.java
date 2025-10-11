package com.codeless.backend.service;

import com.codeless.backend.domain.Course;
import com.codeless.backend.domain.CourseReview;
import com.codeless.backend.domain.User;
import com.codeless.backend.repository.CourseRepository;
import com.codeless.backend.repository.CourseReviewRepository;
import com.codeless.backend.repository.EnrollmentRepository;
import com.codeless.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Service for managing course reviews and ratings.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourseReviewService {

    private final CourseReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    /**
     * Submit or update a review for a course.
     * Only users who have purchased the course can leave a review.
     */
    @Transactional
    public CourseReview submitReview(Long courseId, Long userId, Integer rating, String reviewText) {
        log.info("User {} submitting review for course {}: rating={}", userId, courseId, rating);

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Check if course exists
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has purchased/enrolled in the course
        // Admins can review any course without enrollment
        boolean isAdmin = user.getRoles().contains("ROLE_ADMIN");
        boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
        
        if (!isEnrolled && !isAdmin) {
            throw new IllegalStateException("You must purchase this course before leaving a review");
        }

        // Check if user already has a review
        CourseReview review = reviewRepository.findByCourseIdAndUserId(courseId, userId)
            .orElse(new CourseReview());

        // Update review
        boolean isNew = review.getId() == null;
        review.setCourse(course);
        review.setUser(user);
        review.setRating(rating);
        review.setReviewText(reviewText);

        CourseReview saved = reviewRepository.save(review);

        // Update course average rating
        updateCourseRating(courseId);

        log.info("{} review for course {}: reviewId={}", isNew ? "Created" : "Updated", courseId, saved.getId());
        return saved;
    }

    /**
     * Get all reviews for a course (paginated)
     */
    public Page<CourseReview> getCourseReviews(Long courseId, Pageable pageable) {
        return reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId, pageable);
    }

    /**
     * Get a user's review for a course (if exists)
     */
    public CourseReview getUserReview(Long courseId, Long userId) {
        return reviewRepository.findByCourseIdAndUserId(courseId, userId)
            .orElse(null);
    }

    /**
     * Delete a review
     */
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        log.info("User {} deleting review {}", userId, reviewId);

        CourseReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));

        // Verify ownership
        if (!review.getUser().getId().equals(userId)) {
            throw new IllegalStateException("You can only delete your own reviews");
        }

        Long courseId = review.getCourse().getId();
        reviewRepository.delete(review);

        // Update course average rating
        updateCourseRating(courseId);

        log.info("Review {} deleted successfully", reviewId);
    }

    /**
     * Update the average rating and review count for a course
     */
    @Transactional
    public void updateCourseRating(Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        long reviewCount = reviewRepository.countByCourseId(courseId);
        Double avgRating = reviewRepository.calculateAverageRating(courseId);

        course.setReviewCount((int) reviewCount);
        
        if (avgRating != null) {
            // Round to 2 decimal places
            BigDecimal rounded = BigDecimal.valueOf(avgRating)
                .setScale(2, RoundingMode.HALF_UP);
            course.setAverageRating(rounded);
        } else {
            course.setAverageRating(BigDecimal.ZERO);
        }

        courseRepository.save(course);
        
        log.info("Updated course {} rating: avg={}, count={}", 
            courseId, course.getAverageRating(), course.getReviewCount());
    }
}

