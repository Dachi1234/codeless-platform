package com.codeless.backend.web.api.dto;

import com.codeless.backend.domain.Cart;
import com.codeless.backend.domain.CartItem;

import java.time.OffsetDateTime;
import java.util.List;

public record CartDTO(
        Long id,
        Long userId,
        List<CartItemDTO> items,
        int itemCount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static CartDTO from(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(CartItemDTO::from)
                .toList();
        
        return new CartDTO(
                cart.getId(),
                cart.getUser().getId(),
                itemDTOs,
                itemDTOs.size(),
                cart.getCreatedAt(),
                cart.getUpdatedAt()
        );
    }
    
    public record CartItemDTO(
            Long id,
            CourseDTO course,
            OffsetDateTime addedAt
    ) {
        public static CartItemDTO from(CartItem item) {
            return new CartItemDTO(
                    item.getId(),
                    CourseDTO.from(item.getCourse()),
                    item.getAddedAt()
            );
        }
    }
    
    public record AddItemRequest(Long courseId) {}
    
    public record MergeCartRequest(List<Long> courseIds) {}
    
    public record GuestCartRequest(List<Long> courseIds) {}
    
    public record ValidationResponse(List<String> removedCourseTitles) {}
    
    public record GuestValidationResponse(List<Long> validCourseIds) {}
}

