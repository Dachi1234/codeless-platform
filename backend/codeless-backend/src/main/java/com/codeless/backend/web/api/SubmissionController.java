package com.codeless.backend.web.api;

import com.codeless.backend.domain.Submission;
import com.codeless.backend.domain.User;
import com.codeless.backend.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Submissions", description = "Manage assignment submissions for live courses")
@SecurityRequirement(name = "Bearer Authentication")
public class SubmissionController {

    private final SubmissionService submissionService;

    /**
     * Submit an assignment (student)
     */
    @Operation(
        summary = "Submit assignment",
        description = "Upload a file to submit an assignment (student). Late submissions are allowed but marked."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignment submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file or validation error"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "404", description = "Assignment not found"),
        @ApiResponse(responseCode = "500", description = "Upload failed")
    })
    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(
        @PathVariable Long assignmentId,
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal User currentUser
    ) {
        try {
            Submission submission = submissionService.submitAssignment(assignmentId, currentUser.getId(), file);
            
            String message = submission.getIsLate() 
                ? String.format("Assignment submitted %d day(s) late", submission.getDaysLate())
                : "Assignment submitted on time";

            return ResponseEntity.ok(Map.of(
                "success", true,
                "submission", submission,
                "message", message,
                "isLate", submission.getIsLate(),
                "daysLate", submission.getDaysLate()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to upload file: " + e.getMessage()
            ));
        }
    }

    /**
     * Get my submission for an assignment (student)
     */
    @Operation(
        summary = "Get my submission",
        description = "Get the authenticated user's submission for a specific assignment"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Submission retrieved (or null if not submitted)"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "404", description = "Assignment not found")
    })
    @GetMapping("/assignments/{assignmentId}/my-submission")
    public ResponseEntity<Submission> getMySubmission(
        @PathVariable Long assignmentId,
        @AuthenticationPrincipal User currentUser
    ) {
        Submission submission = submissionService.getMySubmission(assignmentId, currentUser.getId());
        return ResponseEntity.ok(submission);
    }

    /**
     * Get all submissions for an assignment (admin)
     */
    @Operation(
        summary = "Get assignment submissions",
        description = "Get all student submissions for a specific assignment (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Submissions retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Assignment not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<Submission>> getAssignmentSubmissions(@PathVariable Long assignmentId) {
        List<Submission> submissions = submissionService.getSubmissionsForAssignment(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    /**
     * Get all submissions for a course (admin)
     */
    @Operation(
        summary = "Get course submissions",
        description = "Get all submissions for all assignments in a course (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Submissions retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/courses/{courseId}/submissions")
    public ResponseEntity<List<Submission>> getCourseSubmissions(@PathVariable Long courseId) {
        List<Submission> submissions = submissionService.getSubmissionsForCourse(courseId);
        return ResponseEntity.ok(submissions);
    }

    /**
     * Grade a submission (admin)
     */
    @Operation(
        summary = "Grade submission",
        description = "Assign a grade and feedback to a student's submission (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Submission graded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid grade (must be 0-maxGrade)"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Submission not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/submissions/{submissionId}/grade")
    public ResponseEntity<Submission> gradeSubmission(
        @PathVariable Long submissionId,
        @RequestBody GradeRequest gradeRequest,
        @AuthenticationPrincipal User currentUser
    ) {
        Submission graded = submissionService.gradeSubmission(
            submissionId,
            gradeRequest.getGrade(),
            gradeRequest.getFeedback(),
            currentUser.getId()
        );
        return ResponseEntity.ok(graded);
    }

    /**
     * Delete a submission (admin)
     */
    @Operation(
        summary = "Delete submission",
        description = "Delete a student's submission (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Submission deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Submission not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/submissions/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get ungraded submissions (admin dashboard)
     */
    @Operation(
        summary = "Get ungraded submissions",
        description = "Get all submissions that haven't been graded yet (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Submissions retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/submissions/ungraded")
    public ResponseEntity<List<Submission>> getUngradedSubmissions() {
        List<Submission> submissions = submissionService.getUngradedSubmissions();
        return ResponseEntity.ok(submissions);
    }

    /**
     * Get late submissions (admin dashboard)
     */
    @Operation(
        summary = "Get late submissions",
        description = "Get all submissions that were submitted after the due date (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Submissions retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/submissions/late")
    public ResponseEntity<List<Submission>> getLateSubmissions() {
        List<Submission> submissions = submissionService.getLateSubmissions();
        return ResponseEntity.ok(submissions);
    }

    /**
     * DTO for grading request
     */
    @Data
    public static class GradeRequest {
        private Integer grade;
        private String feedback;
    }
}

