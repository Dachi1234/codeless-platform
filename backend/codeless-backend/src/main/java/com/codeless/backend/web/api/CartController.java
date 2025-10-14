package com.codeless.backend.web.api;

import com.codeless.backend.domain.Cart;
import com.codeless.backend.service.CartService;
import com.codeless.backend.web.api.dto.CartDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Cart", description = "Shopping cart management")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @Operation(summary = "Get current user's cart")
    @GetMapping
    public ResponseEntity<CartDTO> getCart(Authentication auth) {
        Cart cart = cartService.getCart(auth.getName());
        return ResponseEntity.ok(CartDTO.from(cart));
    }

    @Operation(summary = "Add course to cart")
    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItem(@RequestBody CartDTO.AddItemRequest request, Authentication auth) {
        Cart cart = cartService.addItem(auth.getName(), request.courseId());
        return ResponseEntity.ok(CartDTO.from(cart));
    }

    @Operation(summary = "Remove course from cart")
    @DeleteMapping("/items/{courseId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long courseId, Authentication auth) {
        cartService.removeItem(auth.getName(), courseId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Clear all items from cart")
    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication auth) {
        cartService.clearCart(auth.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Merge guest cart items with user cart (after login)")
    @PostMapping("/merge")
    public ResponseEntity<CartDTO> mergeGuestCart(@RequestBody CartDTO.MergeCartRequest request, Authentication auth) {
        Cart cart = cartService.mergeGuestCart(auth.getName(), request.courseIds());
        return ResponseEntity.ok(CartDTO.from(cart));
    }

    @Operation(summary = "Get course details for guest cart (no auth required)")
    @PostMapping("/guest/details")
    public ResponseEntity<?> getGuestCartDetails(@RequestBody CartDTO.GuestCartRequest request) {
        return ResponseEntity.ok(cartService.getGuestCartDetails(request.courseIds()));
    }

    @Operation(summary = "Validate cart and remove unpublished courses")
    @PostMapping("/validate")
    public ResponseEntity<CartDTO.ValidationResponse> validateCart(Authentication auth) {
        java.util.List<String> removedTitles = cartService.validateAndCleanCart(auth.getName());
        return ResponseEntity.ok(new CartDTO.ValidationResponse(removedTitles));
    }

    @Operation(summary = "Validate guest cart and filter unpublished courses (no auth required)")
    @PostMapping("/guest/validate")
    public ResponseEntity<CartDTO.GuestValidationResponse> validateGuestCart(@RequestBody CartDTO.GuestCartRequest request) {
        java.util.List<Long> validCourseIds = cartService.validateGuestCart(request.courseIds());
        return ResponseEntity.ok(new CartDTO.GuestValidationResponse(validCourseIds));
    }
}

