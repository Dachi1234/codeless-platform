package com.codeless.backend.web.api.admin;

import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Admin - Enrollments", description = "Admin enrollment management")
@RestController
@RequestMapping("/api/admin/enrollments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminEnrollmentsController {

    private final JdbcTemplate jdbcTemplate;

    @Data
    public static class AdminEnrollmentDTO {
        private Long id;
        private String userName;
        private String userEmail;
        private String courseTitle;
        private String enrolledAt;
        private Integer progress;
    }

    @GetMapping
    public ResponseEntity<List<AdminEnrollmentDTO>> listEnrollments(@RequestParam(required = false) String q) {
        String sql = """
                SELECT e.id, u.full_name AS user_name, u.email AS user_email, 
                       c.title AS course_title, e.enrolled_at,
                       0 AS progress
                FROM enrollments e
                JOIN users u ON e.user_id = u.id
                JOIN course c ON e.course_id = c.id
                WHERE 1=1
                """;

        if (q != null && !q.isBlank()) {
            sql += " AND (u.email ILIKE '%" + q + "%' OR u.full_name ILIKE '%" + q + "%' OR c.title ILIKE '%" + q + "%')";
        }

        sql += " ORDER BY e.enrolled_at DESC";

        List<AdminEnrollmentDTO> enrollments = jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminEnrollmentDTO dto = new AdminEnrollmentDTO();
            dto.setId(rs.getLong("id"));
            dto.setUserName(rs.getString("user_name"));
            dto.setUserEmail(rs.getString("user_email"));
            dto.setCourseTitle(rs.getString("course_title"));
            dto.setEnrolledAt(rs.getString("enrolled_at"));
            dto.setProgress(rs.getInt("progress"));
            return dto;
        });

        return ResponseEntity.ok(enrollments);
    }
}

