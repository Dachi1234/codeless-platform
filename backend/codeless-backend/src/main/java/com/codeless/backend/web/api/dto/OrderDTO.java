package com.codeless.backend.web.api.dto;

import com.codeless.backend.domain.Order;
import com.codeless.backend.domain.OrderStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderDTO(
        Long id,
        Long userId,
        OrderStatus status,
        String currency,
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal total,
        String provider,
        String providerPaymentId,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<OrderItemDTO> items
) {
    public static OrderDTO from(Order order) {
        return new OrderDTO(
                order.getId(),
                order.getUser().getId(),
                order.getStatus(),
                order.getCurrency(),
                order.getSubtotal(),
                order.getDiscount(),
                order.getTotal(),
                order.getProvider(),
                order.getProviderPaymentId(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getItems().stream().map(OrderItemDTO::from).toList()
        );
    }

    public record OrderItemDTO(
            Long id,
            Long courseId,
            String courseTitle,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal lineTotal
    ) {
        public static OrderItemDTO from(com.codeless.backend.domain.OrderItem item) {
            return new OrderItemDTO(
                    item.getId(),
                    item.getCourse().getId(),
                    item.getCourse().getTitle(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    item.getLineTotal()
            );
        }
    }
}

