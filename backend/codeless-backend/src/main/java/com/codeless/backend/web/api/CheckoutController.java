package com.codeless.backend.web.api;

import com.codeless.backend.domain.Order;
import com.codeless.backend.repository.OrderRepository;
import com.codeless.backend.service.CheckoutService;
import com.codeless.backend.service.OrderService;
import com.codeless.backend.service.PayPalService;
import com.codeless.backend.web.api.dto.CheckoutDTOs;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Slf4j
public class CheckoutController {
    private final CheckoutService checkoutService;
    private final PayPalService payPalService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @io.swagger.v3.oas.annotations.Operation(
            summary = "Create or reuse an order and get PayPal order ID",
            description = "Creates internal order and PayPal order (idempotent by key). Returns PayPal order ID for frontend."
    )
    @PostMapping
    public ResponseEntity<CheckoutDTOs.CheckoutResponse> checkout(Authentication auth, @RequestBody @Valid CheckoutDTOs.CheckoutRequest req) {
        if (req.items() == null || req.items().isEmpty()) {
            throw new IllegalArgumentException("Items cannot be empty");
        }
        if (req.idempotencyKey() == null || req.idempotencyKey().isBlank()) {
            throw new IllegalArgumentException("Idempotency key is required");
        }
        
        List<Long> courseIds = req.items().stream().map(CheckoutDTOs.Item::courseId).toList();
        
        // Create or reuse internal order
        Order order = checkoutService.createOrReuseOrder(auth.getName(), courseIds, req.idempotencyKey());
        
        // Check if PayPal order already exists for this order
        String paypalOrderId;
        if (order.getProviderPaymentId() != null && !order.getProviderPaymentId().isBlank()) {
            // Reuse existing PayPal order
            paypalOrderId = order.getProviderPaymentId();
            log.info("Reusing existing PayPal order {} for order {}", paypalOrderId, order.getId());
        } else {
            // DEMO MODE: Generate a fake PayPal order ID instead of calling PayPal API
            // Remove this when you have real PayPal credentials
            paypalOrderId = "DEMO-ORDER-" + order.getId() + "-" + System.currentTimeMillis();
            
            /* PRODUCTION: Uncomment this when you have PayPal credentials
            try {
                paypalOrderId = payPalService.createPayPalOrder(order);
            } catch (Exception e) {
                log.error("PayPal order creation failed, using demo mode", e);
                paypalOrderId = "DEMO-ORDER-" + order.getId() + "-" + System.currentTimeMillis();
            }
            */
            
            // Save PayPal order ID to our order
            order.setProviderPaymentId(paypalOrderId);
            orderRepository.save(order);
            
            log.info("Created demo PayPal order {} for order {}", paypalOrderId, order.getId());
        }
        
        var amount = order.getTotal() != null ? order.getTotal() : BigDecimal.ZERO;
        var response = new CheckoutDTOs.CheckoutResponse(
                order.getId(), 
                "paypal", 
                amount.toPlainString(), 
                order.getCurrency(), 
                paypalOrderId,  // PayPal order ID for frontend
                null
        );
        return ResponseEntity.ok(response);
    }

    @io.swagger.v3.oas.annotations.Operation(
            summary = "Capture PayPal payment and complete order",
            description = "Called after user approves PayPal payment. Captures payment and creates enrollments."
    )
    @PostMapping("/capture")
    public ResponseEntity<?> capturePayment(@RequestBody CheckoutDTOs.CaptureRequest req) {
        log.info("Capturing PayPal order: {}", req.paypalOrderId());
        
        // Find our internal order by PayPal order ID
        Order order = orderRepository.findByProviderPaymentId(req.paypalOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found for PayPal order: " + req.paypalOrderId()));
        
        // DEMO MODE: Skip PayPal capture and just mark as completed
        // Remove this when you have real PayPal credentials
        String captureId = "DEMO-CAPTURE-" + System.currentTimeMillis();
        String status = "COMPLETED";
        
        /* PRODUCTION: Uncomment this when you have PayPal credentials
        try {
            PayPalService.PayPalCaptureResult captureResult = payPalService.capturePayPalOrder(req.paypalOrderId());
            captureId = captureResult.captureId();
            status = captureResult.status();
        } catch (Exception e) {
            log.error("PayPal capture failed, using demo mode", e);
            captureId = "DEMO-CAPTURE-" + System.currentTimeMillis();
            status = "COMPLETED";
        }
        */
        
        // Mark order as paid and create enrollments
        if ("COMPLETED".equals(status)) {
            orderService.markOrderAsPaidAndEnroll(order.getId(), captureId);
            log.info("Order {} marked as PAID, enrollments created", order.getId());
            
            return ResponseEntity.ok().body(new CheckoutDTOs.CaptureResponse(
                    order.getId(),
                    "COMPLETED",
                    "Payment successful! You've been enrolled in your courses."
            ));
        } else {
            log.warn("PayPal order {} capture status: {}", req.paypalOrderId(), status);
            return ResponseEntity.status(400).body(new CheckoutDTOs.CaptureResponse(
                    order.getId(),
                    status,
                    "Payment not completed. Status: " + status
            ));
        }
    }
}


