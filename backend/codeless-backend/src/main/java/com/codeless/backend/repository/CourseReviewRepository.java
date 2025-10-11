package com.codeless.backend.repository;

import com.codeless.backend.domain.CourseReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    /**
     * Find all reviews for a specific course (paginated)
     * Uses JOIN FETCH to eagerly load User and Course relationships
     */
    @Query("SELECT r FROM CourseReview r " +
           "JOIN FETCH r.user " +
           "JOIN FETCH r.course " +
           "WHERE r.course.id = :courseId " +
           "ORDER BY r.createdAt DESC")
    Page<CourseReview> findByCourseIdOrderByCreatedAtDesc(@Param("courseId") Long courseId, Pageable pageable);

    /**
     * Find a specific user's review for a course
     * Uses JOIN FETCH to eagerly load User and Course relationships
     */
    @Query("SELECT r FROM CourseReview r " +
           "JOIN FETCH r.user " +
           "JOIN FETCH r.course " +
           "WHERE r.course.id = :courseId AND r.user.id = :userId")
    Optional<CourseReview> findByCourseIdAndUserId(@Param("courseId") Long courseId, @Param("userId") Long userId);

    /**
     * Check if a user has already reviewed a course
     */
    boolean existsByCourseIdAndUserId(Long courseId, Long userId);

    /**
     * Count total reviews for a course
     */
    long countByCourseId(Long courseId);

    /**
     * Calculate average rating for a course
     */
    @Query("SELECT AVG(r.rating) FROM CourseReview r WHERE r.course.id = :courseId")
    Double calculateAverageRating(@Param("courseId") Long courseId);

    /**
     * Delete all reviews for a specific course
     */
    void deleteByCourseId(Long courseId);
}

