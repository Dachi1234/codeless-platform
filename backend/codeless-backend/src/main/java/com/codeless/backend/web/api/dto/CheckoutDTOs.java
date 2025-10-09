package com.codeless.backend.web.api.dto;

import java.util.List;

public class CheckoutDTOs {
    public record Item(Long courseId, Integer quantity) {}
    
    public record CheckoutRequest(List<Item> items, String idempotencyKey) {}
    
    public record CheckoutResponse(
            Long orderId, 
            String provider, 
            String amount, 
            String currency, 
            String paypalOrderId,  // PayPal order ID for frontend
            String clientToken     // For future payment methods
    ) {}
    
    public record CaptureRequest(String paypalOrderId) {}
    
    public record CaptureResponse(
            Long orderId,
            String status,
            String message
    ) {}
}


