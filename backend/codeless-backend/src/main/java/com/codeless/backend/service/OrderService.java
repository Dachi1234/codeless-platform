package com.codeless.backend.service;

import com.codeless.backend.domain.Enrollment;
import com.codeless.backend.domain.Order;
import com.codeless.backend.domain.OrderItem;
import com.codeless.backend.domain.OrderStatus;
import com.codeless.backend.repository.EnrollmentRepository;
import com.codeless.backend.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/**
 * Service for order-related business logic including enrollment automation
 */
@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    
    private final OrderRepository orderRepository;
    private final EnrollmentRepository enrollmentRepository;

    public OrderService(OrderRepository orderRepository, EnrollmentRepository enrollmentRepository) {
        this.orderRepository = orderRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    /**
     * Mark order as paid and automatically create enrollments for all courses
     * @param orderId The order ID to mark as paid
     * @param captureId The payment capture ID (e.g., PayPal capture ID)
     * @return Updated order
     */
    @Transactional
    public Order markOrderAsPaidAndEnroll(Long orderId, String captureId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        
        if (order.getStatus() == OrderStatus.PAID) {
            log.info("Order {} already paid, skipping", orderId);
            return order;
        }
        
        // Update order status and capture ID
        order.setStatus(OrderStatus.PAID);
        order.setProviderPaymentId(captureId); // Store the capture ID
        order.setUpdatedAt(OffsetDateTime.now());
        order = orderRepository.save(order);
        
        // Create enrollments for each course in the order
        for (OrderItem item : order.getItems()) {
            try {
                // Check if already enrolled
                boolean alreadyEnrolled = enrollmentRepository.existsByUserIdAndCourseId(
                        order.getUser().getId(), 
                        item.getCourse().getId()
                );
                
                if (!alreadyEnrolled) {
                    Enrollment enrollment = new Enrollment();
                    enrollment.setUser(order.getUser());
                    enrollment.setCourse(item.getCourse());
                    enrollment.setEnrolledAt(OffsetDateTime.now());
                    enrollmentRepository.save(enrollment);
                    
                    log.info("Created enrollment for user {} in course {}", 
                            order.getUser().getEmail(), 
                            item.getCourse().getTitle());
                } else {
                    log.info("User {} already enrolled in course {}, skipping", 
                            order.getUser().getEmail(), 
                            item.getCourse().getTitle());
                }
            } catch (Exception e) {
                log.error("Failed to create enrollment for order item {}: {}", item.getId(), e.getMessage());
                // Continue with other enrollments even if one fails
            }
        }
        
        log.info("Order {} marked as paid and enrollments created", orderId);
        return order;
    }
    
    /**
     * Mark order as failed
     * @param orderId The order ID to mark as failed
     * @return Updated order
     */
    @Transactional
    public Order markOrderAsFailed(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        
        order.setStatus(OrderStatus.FAILED);
        order.setUpdatedAt(OffsetDateTime.now());
        
        log.info("Order {} marked as failed", orderId);
        return orderRepository.save(order);
    }
}

