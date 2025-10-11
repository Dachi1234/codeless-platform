package com.codeless.backend.repository;

import com.codeless.backend.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.course.id = :courseId")
    long countByCourseId(@Param("courseId") Long courseId);
}

