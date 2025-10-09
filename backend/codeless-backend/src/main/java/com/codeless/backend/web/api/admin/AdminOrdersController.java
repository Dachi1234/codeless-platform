package com.codeless.backend.web.api.admin;

import com.codeless.backend.domain.Order;
import com.codeless.backend.domain.OrderStatus;
import com.codeless.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Admin - Orders", description = "Admin order management")
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrdersController {

    private final OrderRepository orderRepository;
    private final JdbcTemplate jdbcTemplate;

    @Data
    public static class AdminOrderDTO {
        private Long id;
        private String userName;
        private String userEmail;
        private BigDecimal totalAmount;
        private String status;
        private String paymentMethod;
        private String createdAt;
        private Integer itemCount;
    }

    @GetMapping
    public ResponseEntity<List<AdminOrderDTO>> listOrders(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status
    ) {
        String sql = """
                SELECT o.id, u.full_name AS user_name, u.email AS user_email, 
                       o.total, o.status, o.provider, o.created_at,
                       (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE 1=1
                """;

        if (q != null && !q.isBlank()) {
            sql += " AND (u.email ILIKE '%" + q + "%' OR u.full_name ILIKE '%" + q + "%')";
        }

        if (status != null && !status.isBlank()) {
            sql += " AND o.status = '" + status + "'";
        }

        sql += " ORDER BY o.created_at DESC";

        List<AdminOrderDTO> orders = jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminOrderDTO dto = new AdminOrderDTO();
            dto.setId(rs.getLong("id"));
            dto.setUserName(rs.getString("user_name"));
            dto.setUserEmail(rs.getString("user_email"));
            dto.setTotalAmount(rs.getBigDecimal("total"));
            dto.setStatus(rs.getString("status"));
            dto.setPaymentMethod(rs.getString("provider"));
            dto.setCreatedAt(rs.getString("created_at"));
            dto.setItemCount(rs.getInt("item_count"));
            return dto;
        });

        return ResponseEntity.ok(orders);
    }

    @PostMapping("/{id}/refund")
    @Transactional
    public ResponseEntity<Void> refundOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getStatus().equals(OrderStatus.PAID)) {
            throw new IllegalStateException("Can only refund PAID orders");
        }

        order.setStatus(OrderStatus.REFUNDED);
        order.setUpdatedAt(OffsetDateTime.now());
        orderRepository.save(order);

        // TODO: Implement actual payment gateway refund logic (PayPal, Stripe, etc.)
        // For now, just mark as refunded in the database

        return ResponseEntity.ok().build();
    }
}

