package com.codeless.backend.web.api;

import com.codeless.backend.domain.LiveSession;
import com.codeless.backend.service.LiveSessionService;
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
@Tag(name = "Live Sessions", description = "Manage live course sessions (Zoom meetings)")
@SecurityRequirement(name = "Bearer Authentication")
public class LiveSessionController {

    private final LiveSessionService sessionService;

    /**
     * Get all sessions for a course (public for enrolled students)
     */
    @Operation(
        summary = "Get course sessions",
        description = "Get all live sessions for a specific course"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sessions retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @GetMapping("/courses/{courseId}/sessions")
    public ResponseEntity<List<LiveSession>> getCourseSessions(@PathVariable Long courseId) {
        List<LiveSession> sessions = sessionService.getSessionsForCourse(courseId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Get a single session by ID
     */
    @Operation(
        summary = "Get session details",
        description = "Get detailed information about a specific session"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Session not found")
    })
    @GetMapping("/sessions/{id}")
    public ResponseEntity<LiveSession> getSession(@PathVariable Long id) {
        LiveSession session = sessionService.getSession(id);
        return ResponseEntity.ok(session);
    }

    /**
     * Get next upcoming session for a course
     */
    @Operation(
        summary = "Get next session",
        description = "Get the next upcoming session for a course"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Next session retrieved (or null if none)"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @GetMapping("/courses/{courseId}/sessions/next")
    public ResponseEntity<LiveSession> getNextSession(@PathVariable Long courseId) {
        LiveSession session = sessionService.getNextSession(courseId);
        return ResponseEntity.ok(session);
    }

    /**
     * Create a new session (admin only)
     */
    @Operation(
        summary = "Create session",
        description = "Create a new live session for a course (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid session data"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/courses/{courseId}/sessions")
    public ResponseEntity<LiveSession> createSession(
        @PathVariable Long courseId,
        @RequestBody LiveSession session
    ) {
        LiveSession created = sessionService.createSession(courseId, session);
        return ResponseEntity.ok(created);
    }

    /**
     * Update a session (admin only)
     */
    @Operation(
        summary = "Update session",
        description = "Update an existing live session (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid session data"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Session not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/sessions/{id}")
    public ResponseEntity<LiveSession> updateSession(
        @PathVariable Long id,
        @RequestBody LiveSession session
    ) {
        LiveSession updated = sessionService.updateSession(id, session);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update session status (admin only)
     */
    @Operation(
        summary = "Update session status",
        description = "Update the status of a session (SCHEDULED, LIVE, COMPLETED, CANCELLED)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status updated successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Session not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/sessions/{id}/status")
    public ResponseEntity<Void> updateSessionStatus(
        @PathVariable Long id,
        @RequestParam LiveSession.SessionStatus status
    ) {
        sessionService.updateSessionStatus(id, status);
        return ResponseEntity.ok().build();
    }

    /**
     * Delete a session (admin only)
     */
    @Operation(
        summary = "Delete session",
        description = "Delete a live session (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Session deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Session not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all upcoming sessions (admin dashboard)
     */
    @Operation(
        summary = "Get all upcoming sessions",
        description = "Get all upcoming sessions across all courses (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sessions retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/sessions/upcoming")
    public ResponseEntity<List<LiveSession>> getUpcomingSessions() {
        List<LiveSession> sessions = sessionService.getUpcomingSessions();
        return ResponseEntity.ok(sessions);
    }
}

