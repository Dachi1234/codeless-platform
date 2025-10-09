package com.codeless.backend.web.api;

import com.codeless.backend.domain.Order;
import com.codeless.backend.domain.User;
import com.codeless.backend.repository.OrderRepository;
import com.codeless.backend.repository.UserRepository;
import com.codeless.backend.web.api.dto.OrderDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/orders")
public class OrdersController {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrdersController(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Get my order history")
    @GetMapping
    public ResponseEntity<Page<OrderDTO>> listMine(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderDTO> orders = orderRepository.findByUser(user, pageable).map(OrderDTO::from);
        return ResponseEntity.ok(orders);
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Get order details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getById(Authentication auth, @PathVariable Long id) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return orderRepository.findById(id)
                .filter(order -> order.getUser().getId().equals(user.getId()))
                .map(OrderDTO::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

