package com.codeless.backend.repository;

import com.codeless.backend.domain.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    /**
     * Find all submissions for a specific assignment
     */
    List<Submission> findByAssignmentIdOrderBySubmittedAtDesc(Long assignmentId);

    /**
     * Find a user's submission for a specific assignment
     */
    Optional<Submission> findByAssignmentIdAndUserId(Long assignmentId, Long userId);

    /**
     * Find all submissions by a specific user
     */
    List<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId);

    /**
     * Find submissions for assignments in a specific course
     */
    @Query("SELECT s FROM Submission s WHERE s.assignment.course.id = :courseId ORDER BY s.submittedAt DESC")
    List<Submission> findByCourseId(@Param("courseId") Long courseId);

    /**
     * Find late submissions
     */
    List<Submission> findByIsLateTrueOrderBySubmittedAtDesc();

    /**
     * Find graded submissions
     */
    @Query("SELECT s FROM Submission s WHERE s.grade IS NOT NULL ORDER BY s.gradedAt DESC")
    List<Submission> findGradedSubmissions();

    /**
     * Find ungraded submissions
     */
    @Query("SELECT s FROM Submission s WHERE s.grade IS NULL ORDER BY s.submittedAt ASC")
    List<Submission> findUngradedSubmissions();

    /**
     * Count submissions for an assignment
     */
    long countByAssignmentId(Long assignmentId);

    /**
     * Count late submissions for an assignment
     */
    long countByAssignmentIdAndIsLateTrue(Long assignmentId);

    /**
     * Check if a user has submitted an assignment
     */
    boolean existsByAssignmentIdAndUserId(Long assignmentId, Long userId);

    /**
     * Delete all submissions for an assignment
     */
    void deleteByAssignmentId(Long assignmentId);
}

