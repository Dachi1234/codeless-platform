package com.codeless.backend.service;

import com.codeless.backend.domain.*;
import com.codeless.backend.exception.ConflictException;
import com.codeless.backend.exception.ResourceNotFoundException;
import com.codeless.backend.repository.CartRepository;
import com.codeless.backend.repository.CourseRepository;
import com.codeless.backend.repository.EnrollmentRepository;
import com.codeless.backend.repository.UserRepository;
import com.codeless.backend.web.api.dto.CartDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CartService(CartRepository cartRepository, CourseRepository courseRepository, 
                      UserRepository userRepository, EnrollmentRepository enrollmentRepository) {
        this.cartRepository = cartRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional(readOnly = true)
    public Cart getCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));
        
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> getOrCreateCart(user));
    }

    @Transactional
    public Cart addItem(String userEmail, Long courseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));
        
        // Check if user is already enrolled
        boolean alreadyEnrolled = enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId);
        if (alreadyEnrolled) {
            throw new ConflictException("You are already enrolled in this course");
        }
        
        Cart cart = getOrCreateCart(user);
        
        // Check if course already in cart
        boolean alreadyInCart = cart.getItems().stream()
                .anyMatch(item -> item.getCourse().getId().equals(courseId));
        
        if (alreadyInCart) {
            throw new ConflictException("Course already in cart");
        }
        
        // Add item to cart
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setCourse(course);
        item.setAddedAt(OffsetDateTime.now());
        cart.getItems().add(item);
        cart.setUpdatedAt(OffsetDateTime.now());
        
        return cartRepository.save(cart);
    }

    @Transactional
    public void removeItem(String userEmail, Long courseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));
        
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        
        cart.getItems().removeIf(item -> item.getCourse().getId().equals(courseId));
        cart.setUpdatedAt(OffsetDateTime.now());
        
        cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));
        
        cartRepository.findByUserIdWithItems(user.getId()).ifPresent(cart -> {
            cart.getItems().clear();
            cart.setUpdatedAt(OffsetDateTime.now());
            cartRepository.save(cart);
        });
    }

    @Transactional
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId()).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setCreatedAt(OffsetDateTime.now());
            newCart.setUpdatedAt(OffsetDateTime.now());
            return cartRepository.save(newCart);
        });
    }

    /**
     * Merge guest cart items with user's cart after login
     */
    @Transactional
    public Cart mergeGuestCart(String userEmail, List<Long> courseIds) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));
        
        Cart cart = getOrCreateCart(user);
        
        // Get current cart course IDs to avoid duplicates
        List<Long> existingCourseIds = cart.getItems().stream()
                .map(item -> item.getCourse().getId())
                .toList();
        
        // Get enrolled course IDs to skip
        List<Long> enrolledCourseIds = enrollmentRepository.findByUser(user).stream()
                .map(enrollment -> enrollment.getCourse().getId())
                .toList();
        
        // Add each course that's not already in cart or enrolled
        for (Long courseId : courseIds) {
            if (!existingCourseIds.contains(courseId) && !enrolledCourseIds.contains(courseId)) {
                courseRepository.findById(courseId).ifPresent(course -> {
                    CartItem item = new CartItem();
                    item.setCart(cart);
                    item.setCourse(course);
                    item.setAddedAt(OffsetDateTime.now());
                    cart.getItems().add(item);
                });
            }
        }
        
        cart.setUpdatedAt(OffsetDateTime.now());
        return cartRepository.save(cart);
    }

    /**
     * Get course details for guest cart items (no authentication required)
     */
    @Transactional(readOnly = true)
    public List<CartDTO.CartItemDTO> getGuestCartDetails(List<Long> courseIds) {
        List<CartDTO.CartItemDTO> items = new ArrayList<>();
        
        for (Long courseId : courseIds) {
            courseRepository.findById(courseId).ifPresent(course -> {
                CartItem tempItem = new CartItem();
                tempItem.setId(courseId); // Use courseId as temp ID
                tempItem.setCourse(course);
                tempItem.setAddedAt(OffsetDateTime.now());
                items.add(CartDTO.CartItemDTO.from(tempItem));
            });
        }
        
        return items;
    }
}

