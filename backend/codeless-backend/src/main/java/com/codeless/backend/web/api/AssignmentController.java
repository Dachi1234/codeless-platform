package com.codeless.backend.web.api;

import com.codeless.backend.domain.Assignment;
import com.codeless.backend.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Manage assignments for live courses")
@SecurityRequirement(name = "Bearer Authentication")
public class AssignmentController {

    private final AssignmentService assignmentService;

    /**
     * Get all assignments for a course
     */
    @Operation(
        summary = "Get course assignments",
        description = "Get all assignments for a specific live course"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignments retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @GetMapping("/courses/{courseId}/assignments")
    public ResponseEntity<List<Assignment>> getCourseAssignments(@PathVariable Long courseId) {
        List<Assignment> assignments = assignmentService.getAssignmentsForCourse(courseId);
        return ResponseEntity.ok(assignments);
    }

    /**
     * Get a single assignment by ID
     */
    @Operation(
        summary = "Get assignment details",
        description = "Get detailed information about a specific assignment"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignment retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Assignment not found")
    })
    @GetMapping("/assignments/{id}")
    public ResponseEntity<Assignment> getAssignment(@PathVariable Long id) {
        Assignment assignment = assignmentService.getAssignment(id);
        return ResponseEntity.ok(assignment);
    }

    /**
     * Create a new assignment (admin only)
     */
    @Operation(
        summary = "Create assignment",
        description = "Create a new assignment for a live course (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignment created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid assignment data"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/courses/{courseId}/assignments")
    public ResponseEntity<Assignment> createAssignment(
        @PathVariable Long courseId,
        @RequestBody Assignment assignment
    ) {
        Assignment created = assignmentService.createAssignment(courseId, assignment);
        return ResponseEntity.ok(created);
    }

    /**
     * Update an assignment (admin only)
     */
    @Operation(
        summary = "Update assignment",
        description = "Update an existing assignment (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignment updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid assignment data"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Assignment not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/assignments/{id}")
    public ResponseEntity<Assignment> updateAssignment(
        @PathVariable Long id,
        @RequestBody Assignment assignment
    ) {
        Assignment updated = assignmentService.updateAssignment(id, assignment);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete an assignment (admin only)
     */
    @Operation(
        summary = "Delete assignment",
        description = "Delete an assignment (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Assignment deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Assignment not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get upcoming assignments (admin dashboard)
     */
    @Operation(
        summary = "Get upcoming assignments",
        description = "Get all upcoming assignments across all courses (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignments retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/assignments/upcoming")
    public ResponseEntity<List<Assignment>> getUpcomingAssignments() {
        List<Assignment> assignments = assignmentService.getUpcomingAssignments();
        return ResponseEntity.ok(assignments);
    }

    /**
     * Get overdue assignments (admin dashboard)
     */
    @Operation(
        summary = "Get overdue assignments",
        description = "Get all overdue assignments across all courses (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignments retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/assignments/overdue")
    public ResponseEntity<List<Assignment>> getOverdueAssignments() {
        List<Assignment> assignments = assignmentService.getOverdueAssignments();
        return ResponseEntity.ok(assignments);
    }
}

