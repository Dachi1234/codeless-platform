package com.codeless.backend.web.api;

import com.codeless.backend.service.DashboardService;
import com.codeless.backend.web.api.dto.DashboardDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Dashboard", description = "User dashboard and statistics")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "Get dashboard statistics", description = "Returns total courses, completed, learning time, and streak")
    @GetMapping("/stats")
    public ResponseEntity<DashboardDTO.DashboardStatsDTO> getStats(Authentication auth) {
        return ResponseEntity.ok(dashboardService.getStats(auth.getName()));
    }

    @Operation(summary = "Get user achievements")
    @GetMapping("/achievements")
    public ResponseEntity<List<DashboardDTO.AchievementDTO>> getAchievements(Authentication auth) {
        return ResponseEntity.ok(dashboardService.getAchievements(auth.getName()));
    }

    @Operation(summary = "Get enrolled courses with progress", description = "Returns all enrolled courses with completion progress")
    @GetMapping("/courses")
    public ResponseEntity<List<DashboardDTO.CourseProgressDTO>> getCoursesWithProgress(Authentication auth) {
        return ResponseEntity.ok(dashboardService.getEnrolledCoursesWithProgress(auth.getName()));
    }
}

