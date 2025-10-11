package com.codeless.backend.repository;

import com.codeless.backend.domain.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    /**
     * Find all assignments for a specific course
     */
    List<Assignment> findByCourseIdOrderByDueDateAsc(Long courseId);

    /**
     * Find assignments linked to a specific session
     */
    List<Assignment> findByLiveSessionId(Long liveSessionId);

    /**
     * Find upcoming assignments (due date in future)
     */
    @Query("SELECT a FROM Assignment a WHERE a.dueDate > :now ORDER BY a.dueDate ASC")
    List<Assignment> findUpcomingAssignments(@Param("now") OffsetDateTime now);

    /**
     * Find overdue assignments (due date in past, no submission or late submission)
     */
    @Query("SELECT a FROM Assignment a WHERE a.dueDate < :now ORDER BY a.dueDate DESC")
    List<Assignment> findOverdueAssignments(@Param("now") OffsetDateTime now);

    /**
     * Count assignments for a course
     */
    long countByCourseId(Long courseId);

    /**
     * Delete all assignments for a course
     */
    void deleteByCourseId(Long courseId);
}

