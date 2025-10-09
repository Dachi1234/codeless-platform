package com.codeless.backend.service;

import com.codeless.backend.domain.Course;
import com.codeless.backend.domain.Order;
import com.codeless.backend.domain.OrderItem;
import com.codeless.backend.domain.User;
import com.codeless.backend.repository.CourseRepository;
import com.codeless.backend.repository.OrderRepository;
import com.codeless.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CheckoutService {
    private final OrderRepository orderRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CheckoutService(OrderRepository orderRepository, CourseRepository courseRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Order createOrReuseOrder(String userEmail, List<Long> courseIds, String idempotencyKey) {
        // Validate inputs
        if (courseIds == null || courseIds.isEmpty()) {
            throw new IllegalArgumentException("Course IDs cannot be empty");
        }
        
        return orderRepository.findByIdempotencyKey(idempotencyKey).map(existingOrder -> {
            // Validate idempotency - check if items match
            List<Long> existingCourseIds = existingOrder.getItems().stream()
                    .map(item -> item.getCourse().getId())
                    .sorted()
                    .toList();
            List<Long> requestedCourseIds = courseIds.stream().sorted().toList();
            
            if (!existingCourseIds.equals(requestedCourseIds)) {
                throw new IllegalStateException("Idempotency key already used with different items");
            }
            return existingOrder;
        }).orElseGet(() -> {
            User user = userRepository.findByEmail(userEmail).orElseThrow();
            
            // Remove duplicates
            List<Long> uniqueCourseIds = courseIds.stream().distinct().toList();
            
            Order order = new Order();
            order.setUser(user);
            order.setIdempotencyKey(idempotencyKey);
            order.setStatus(com.codeless.backend.domain.OrderStatus.PENDING);
            order.setCurrency("USD");

            BigDecimal subtotal = BigDecimal.ZERO;
            for (Long courseId : uniqueCourseIds) {
                Course c = courseRepository.findById(courseId)
                        .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setCourse(c);
                item.setUnitPrice(c.getPrice());
                item.setQuantity(1);
                item.setLineTotal(c.getPrice());
                order.getItems().add(item);
                subtotal = subtotal.add(c.getPrice());
            }
            order.setSubtotal(subtotal);
            order.setTotal(subtotal);

            return orderRepository.save(order);
        });
    }
}


