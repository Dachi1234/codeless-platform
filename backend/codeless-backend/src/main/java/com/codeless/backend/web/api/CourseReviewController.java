package com.codeless.backend.web.api;

import com.codeless.backend.domain.CourseReview;
import com.codeless.backend.domain.User;
import com.codeless.backend.repository.UserRepository;
import com.codeless.backend.service.CourseReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * REST API for course reviews and ratings.
 */
@Slf4j
@RestController
@RequestMapping("/api/courses/{courseId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Course Reviews", description = "Manage course reviews and ratings")
public class CourseReviewController {

    private final CourseReviewService reviewService;
    private final UserRepository userRepository;

    /**
     * Get all reviews for a course (paginated)
     */
    @Operation(
        summary = "Get course reviews",
        description = "Fetches all reviews for a specific course with pagination"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reviews fetched successfully"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @GetMapping
    public ResponseEntity<Page<ReviewDTO>> getCourseReviews(
        @PathVariable Long courseId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CourseReview> reviews = reviewService.getCourseReviews(courseId, pageable);
        Page<ReviewDTO> dtos = reviews.map(ReviewDTO::from);
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get current user's review for a course
     */
    @Operation(
        summary = "Get my review",
        description = "Fetches the authenticated user's review for a course (if exists)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Review fetched successfully"),
        @ApiResponse(responseCode = "204", description = "User has not reviewed this course"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/me")
    public ResponseEntity<ReviewDTO> getMyReview(
        @PathVariable Long courseId,
        Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        CourseReview review = reviewService.getUserReview(courseId, user.getId());
        
        if (review == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(ReviewDTO.from(review));
    }

    /**
     * Submit or update a review
     */
    @Operation(
        summary = "Submit review",
        description = "Submit a new review or update an existing review for a course. Only users who purchased the course can review."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Review submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid rating or review data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "User has not purchased this course"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<?> submitReview(
        @PathVariable Long courseId,
        @Valid @RequestBody SubmitReviewRequest request,
        Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            CourseReview review = reviewService.submitReview(
                courseId,
                user.getId(),
                request.getRating(),
                request.getReviewText()
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Review submitted successfully",
                "review", ReviewDTO.from(review)
            ));

        } catch (IllegalStateException e) {
            // User hasn't purchased the course
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            // Invalid rating
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Delete a review
     */
    @Operation(
        summary = "Delete review",
        description = "Delete your own review for a course"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Review deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Cannot delete other users' reviews"),
        @ApiResponse(responseCode = "404", description = "Review not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
        @PathVariable Long courseId,
        @PathVariable Long reviewId,
        Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            reviewService.deleteReview(reviewId, user.getId());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Review deleted successfully"
            ));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * DTO for review submission
     */
    @Data
    public static class SubmitReviewRequest {
        private Integer rating; // 1-5
        private String reviewText;
    }

    /**
     * DTO for review response
     */
    @Data
    public static class ReviewDTO {
        private Long id;
        private Long courseId;
        private Long userId;
        private String userName;
        private Integer rating;
        private String reviewText;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        public static ReviewDTO from(CourseReview review) {
            ReviewDTO dto = new ReviewDTO();
            dto.setId(review.getId());
            dto.setCourseId(review.getCourse().getId());
            dto.setUserId(review.getUser().getId());
            dto.setUserName(review.getUser().getFullName());
            dto.setRating(review.getRating());
            dto.setReviewText(review.getReviewText());
            dto.setCreatedAt(review.getCreatedAt());
            dto.setUpdatedAt(review.getUpdatedAt());
            return dto;
        }
    }
}

