package com.codeless.backend.repository;

import com.codeless.backend.domain.Enrollment;
import com.codeless.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.course WHERE e.user = :user")
    List<Enrollment> findByUser(User user);
    
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    
    @Query("SELECT e FROM Enrollment e WHERE e.user.id = :userId AND e.course.id = :courseId")
    java.util.Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
}


