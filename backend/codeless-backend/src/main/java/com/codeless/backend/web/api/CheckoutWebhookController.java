package com.codeless.backend.web.api;

import com.codeless.backend.repository.OrderRepository;
import com.codeless.backend.service.OrderService;
import com.codeless.backend.service.PayPalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/checkout/webhook/paypal")
@RequiredArgsConstructor
@Slf4j
public class CheckoutWebhookController {
    
    private final PayPalService payPalService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    
    @Value("${paypal.webhook-id}")
    private String webhookId;

    @PostMapping
    public ResponseEntity<Void> handleWebhook(
            @RequestHeader(value = "PAYPAL-TRANSMISSION-ID", required = false) String transmissionId,
            @RequestHeader(value = "PAYPAL-TRANSMISSION-TIME", required = false) String transmissionTime,
            @RequestHeader(value = "PAYPAL-CERT-URL", required = false) String certUrl,
            @RequestHeader(value = "PAYPAL-AUTH-ALGO", required = false) String authAlgo,
            @RequestHeader(value = "PAYPAL-TRANSMISSION-SIG", required = false) String transmissionSig,
            @RequestBody String body
    ) {
        log.info("Received PayPal webhook event");
        
        // Verify webhook signature
        boolean isValid = payPalService.verifyWebhookSignature(
                transmissionId, transmissionTime, certUrl, authAlgo, 
                transmissionSig, webhookId, body
        );
        
        if (!isValid) {
            log.warn("Invalid PayPal webhook signature!");
            return ResponseEntity.status(401).build();
        }
        
        // Parse webhook event
        // Note: For production, parse the JSON body to get event type and order ID
        // Then idempotently process the event (e.g., PAYMENT.CAPTURE.COMPLETED)
        log.info("PayPal webhook verified: {}", body);
        
        // TODO: Parse event, extract order ID, and update order status
        // For now, we handle payment capture via the /api/checkout/capture endpoint
        
        return ResponseEntity.ok().build();
    }
}


