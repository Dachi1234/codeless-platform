package com.codeless.backend.repository;

import com.codeless.backend.domain.Order;
import com.codeless.backend.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
    Optional<Order> findByProviderPaymentId(String providerPaymentId);
    List<Order> findByUser(User user);
    Page<Order> findByUser(User user, Pageable pageable);
}


