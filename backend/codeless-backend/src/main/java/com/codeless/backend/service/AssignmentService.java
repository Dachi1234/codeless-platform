package com.codeless.backend.service;

import com.codeless.backend.domain.Assignment;
import com.codeless.backend.domain.Course;
import com.codeless.backend.domain.LiveSession;
import com.codeless.backend.repository.AssignmentRepository;
import com.codeless.backend.repository.CourseRepository;
import com.codeless.backend.repository.LiveSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final LiveSessionRepository sessionRepository;

    /**
     * Get all assignments for a course
     */
    public List<Assignment> getAssignmentsForCourse(Long courseId) {
        return assignmentRepository.findByCourseIdOrderByDueDateAsc(courseId);
    }

    /**
     * Get a single assignment by ID
     */
    public Assignment getAssignment(Long id) {
        return assignmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));
    }

    /**
     * Create a new assignment
     */
    @Transactional
    public Assignment createAssignment(Long courseId, Assignment assignment) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Ensure course is LIVE type
        if (course.getKind() != Course.Kind.LIVE) {
            throw new IllegalArgumentException("Cannot add assignments to non-live courses");
        }

        assignment.setCourse(course);

        // Link to session if provided
        if (assignment.getLiveSession() != null && assignment.getLiveSession().getId() != null) {
            LiveSession session = sessionRepository.findById(assignment.getLiveSession().getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));
            assignment.setLiveSession(session);
        }

        // Validate due date is in future
        if (assignment.getDueDate().isBefore(OffsetDateTime.now())) {
            log.warn("Creating assignment with due date in the past: {}", assignment.getTitle());
        }

        // Set defaults
        if (assignment.getMaxFileSizeMb() == null) {
            assignment.setMaxFileSizeMb(50);
        }
        if (assignment.getMaxGrade() == null) {
            assignment.setMaxGrade(100);
        }

        log.info("Creating assignment {} for course {}", assignment.getTitle(), courseId);
        return assignmentRepository.save(assignment);
    }

    /**
     * Update an assignment
     */
    @Transactional
    public Assignment updateAssignment(Long id, Assignment updatedAssignment) {
        Assignment existing = getAssignment(id);

        existing.setTitle(updatedAssignment.getTitle());
        existing.setDescription(updatedAssignment.getDescription());
        existing.setDueDate(updatedAssignment.getDueDate());
        existing.setMaxFileSizeMb(updatedAssignment.getMaxFileSizeMb());
        existing.setAllowedFileTypes(updatedAssignment.getAllowedFileTypes());
        existing.setMaxGrade(updatedAssignment.getMaxGrade());

        // Update session link if provided
        if (updatedAssignment.getLiveSession() != null && updatedAssignment.getLiveSession().getId() != null) {
            LiveSession session = sessionRepository.findById(updatedAssignment.getLiveSession().getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));
            existing.setLiveSession(session);
        } else {
            existing.setLiveSession(null);
        }

        log.info("Updating assignment {}", id);
        return assignmentRepository.save(existing);
    }

    /**
     * Delete an assignment
     */
    @Transactional
    public void deleteAssignment(Long id) {
        log.info("Deleting assignment {}", id);
        assignmentRepository.deleteById(id);
    }

    /**
     * Get upcoming assignments (due in future)
     */
    public List<Assignment> getUpcomingAssignments() {
        return assignmentRepository.findUpcomingAssignments(OffsetDateTime.now());
    }

    /**
     * Get overdue assignments (due in past)
     */
    public List<Assignment> getOverdueAssignments() {
        return assignmentRepository.findOverdueAssignments(OffsetDateTime.now());
    }

    /**
     * Check if an assignment is overdue
     */
    public boolean isOverdue(Assignment assignment) {
        return assignment.getDueDate().isBefore(OffsetDateTime.now());
    }
}

