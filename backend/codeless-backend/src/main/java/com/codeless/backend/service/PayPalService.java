package com.codeless.backend.service;

import com.codeless.backend.domain.Order;
import com.codeless.backend.domain.OrderItem;
import com.paypal.core.PayPalHttpClient;
import com.paypal.http.HttpResponse;
import com.paypal.orders.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayPalService {

    private final PayPalHttpClient payPalHttpClient;

    @Value("${app.url:http://localhost:4200}")
    private String appUrl;

    /**
     * Create a PayPal order from our internal Order entity
     */
    public String createPayPalOrder(Order order) {
        try {
            // Build PayPal order request
            OrderRequest orderRequest = new OrderRequest();
            orderRequest.checkoutPaymentIntent("CAPTURE");

            // Set application context (return URLs)
            ApplicationContext applicationContext = new ApplicationContext()
                    .returnUrl(appUrl + "/checkout/success")
                    .cancelUrl(appUrl + "/checkout/cancel")
                    .brandName("Codeless E-Learning")
                    .landingPage("BILLING")
                    .shippingPreference("NO_SHIPPING");
            orderRequest.applicationContext(applicationContext);

            // Build purchase units
            List<PurchaseUnitRequest> purchaseUnits = new ArrayList<>();
            PurchaseUnitRequest purchaseUnit = new PurchaseUnitRequest()
                    .referenceId(order.getId().toString())
                    .description("Codeless Course Purchase - Order #" + order.getId())
                    .amountWithBreakdown(new AmountWithBreakdown()
                            .currencyCode(order.getCurrency())
                            .value(order.getTotal().toString())
                            .amountBreakdown(new AmountBreakdown()
                                    .itemTotal(new Money()
                                            .currencyCode(order.getCurrency())
                                            .value(order.getSubtotal().toString())
                                    )
                            )
                    );

            // Add line items
            List<Item> items = new ArrayList<>();
            for (OrderItem orderItem : order.getItems()) {
                Item item = new Item()
                        .name(orderItem.getCourse().getTitle())
                        .description(orderItem.getCourse().getDescription() != null 
                                ? orderItem.getCourse().getDescription().substring(0, Math.min(127, orderItem.getCourse().getDescription().length()))
                                : "Course")
                        .sku(orderItem.getCourse().getId().toString())
                        .unitAmount(new Money()
                                .currencyCode(order.getCurrency())
                                .value(orderItem.getUnitPrice().toString())
                        )
                        .quantity(String.valueOf(orderItem.getQuantity()))
                        .category("DIGITAL_GOODS");
                items.add(item);
            }
            purchaseUnit.items(items);
            purchaseUnits.add(purchaseUnit);
            orderRequest.purchaseUnits(purchaseUnits);

            // Execute API call
            OrdersCreateRequest request = new OrdersCreateRequest();
            request.prefer("return=representation");
            request.requestBody(orderRequest);

            HttpResponse<com.paypal.orders.Order> response = payPalHttpClient.execute(request);
            com.paypal.orders.Order paypalOrder = response.result();
            
            log.info("PayPal order created: {}", paypalOrder.id());
            return paypalOrder.id();

        } catch (Exception e) {
            log.error("Error creating PayPal order: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create PayPal order: " + e.getMessage());
        }
    }

    /**
     * Capture (finalize) a PayPal order
     */
    public PayPalCaptureResult capturePayPalOrder(String paypalOrderId) {
        try {
            OrdersCaptureRequest request = new OrdersCaptureRequest(paypalOrderId);
            request.prefer("return=representation");

            HttpResponse<com.paypal.orders.Order> response = payPalHttpClient.execute(request);
            com.paypal.orders.Order paypalOrder = response.result();

            log.info("PayPal order captured: {}", paypalOrder.id());

            // Extract capture details
            String captureId = null;
            String status = paypalOrder.status();
            
            if (paypalOrder.purchaseUnits() != null && !paypalOrder.purchaseUnits().isEmpty()) {
                PurchaseUnit purchaseUnit = paypalOrder.purchaseUnits().get(0);
                if (purchaseUnit.payments() != null && 
                    purchaseUnit.payments().captures() != null && 
                    !purchaseUnit.payments().captures().isEmpty()) {
                    captureId = purchaseUnit.payments().captures().get(0).id();
                }
            }

            return new PayPalCaptureResult(paypalOrder.id(), captureId, status);

        } catch (Exception e) {
            log.error("Error capturing PayPal order: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to capture PayPal order: " + e.getMessage());
        }
    }

    /**
     * Verify PayPal webhook signature
     */
    public boolean verifyWebhookSignature(String transmissionId, String transmissionTime,
                                           String certUrl, String authAlgo, 
                                           String transmissionSig, String webhookId,
                                           String eventBody) {
        // TODO: Implement webhook signature verification
        // Reference: https://developer.paypal.com/api/rest/webhooks/rest/
        log.warn("Webhook signature verification not yet implemented!");
        return true; // For now, accept all webhooks (INSECURE - FIX IN PRODUCTION)
    }

    /**
     * Result object for PayPal capture operation
     */
    public record PayPalCaptureResult(
            String orderId,
            String captureId,
            String status
    ) {}
}

