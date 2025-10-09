package com.codeless.backend.web.api.admin;

import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Admin - Dashboard", description = "Admin dashboard statistics")
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final JdbcTemplate jdbcTemplate;

    @Data
    public static class DashboardStats {
        private BigDecimal totalRevenue;
        private Long totalEnrollments;
        private Long activeCourses;
        private Long totalUsers;
        private Double revenueChange;
        private Double enrollmentChange;
        private Double courseChange;
        private Double userChange;
    }

    @Data
    public static class RecentOrder {
        private Long id;
        private String userName;
        private String userEmail;
        private BigDecimal totalAmount;
        private String status;
        private String createdAt;
    }

    @Data
    public static class RecentEnrollment {
        private Long id;
        private String userName;
        private String courseTitle;
        private String enrolledAt;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        DashboardStats stats = new DashboardStats();

        // Total revenue (sum of all PAID orders)
        BigDecimal totalRevenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'PAID'",
                BigDecimal.class
        );
        stats.setTotalRevenue(totalRevenue);

        // Total enrollments
        Long totalEnrollments = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM enrollments",
                Long.class
        );
        stats.setTotalEnrollments(totalEnrollments);

        // Active courses (published)
        Long activeCourses = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM course WHERE published = true",
                Long.class
        );
        stats.setActiveCourses(activeCourses);

        // Total users
        Long totalUsers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users",
                Long.class
        );
        stats.setTotalUsers(totalUsers);

        // Placeholder percentage changes (you can implement real logic later)
        stats.setRevenueChange(12.5);
        stats.setEnrollmentChange(8.3);
        stats.setCourseChange(5.0);
        stats.setUserChange(15.2);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<RecentOrder>> getRecentOrders() {
        String sql = """
                SELECT o.id, u.full_name AS user_name, u.email AS user_email, 
                       o.total_amount, o.status, o.created_at
                FROM orders o
                JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC
                LIMIT 10
                """;

        List<RecentOrder> orders = jdbcTemplate.query(sql, (rs, rowNum) -> {
            RecentOrder order = new RecentOrder();
            order.setId(rs.getLong("id"));
            order.setUserName(rs.getString("user_name"));
            order.setUserEmail(rs.getString("user_email"));
            order.setTotalAmount(rs.getBigDecimal("total_amount"));
            order.setStatus(rs.getString("status"));
            order.setCreatedAt(rs.getString("created_at"));
            return order;
        });

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/recent-enrollments")
    public ResponseEntity<List<RecentEnrollment>> getRecentEnrollments() {
        String sql = """
                SELECT e.id, u.full_name AS user_name, c.title AS course_title, e.enrolled_at
                FROM enrollments e
                JOIN users u ON e.user_id = u.id
                JOIN course c ON e.course_id = c.id
                ORDER BY e.enrolled_at DESC
                LIMIT 10
                """;

        List<RecentEnrollment> enrollments = jdbcTemplate.query(sql, (rs, rowNum) -> {
            RecentEnrollment enrollment = new RecentEnrollment();
            enrollment.setId(rs.getLong("id"));
            enrollment.setUserName(rs.getString("user_name"));
            enrollment.setCourseTitle(rs.getString("course_title"));
            enrollment.setEnrolledAt(rs.getString("enrolled_at"));
            return enrollment;
        });

        return ResponseEntity.ok(enrollments);
    }
}

