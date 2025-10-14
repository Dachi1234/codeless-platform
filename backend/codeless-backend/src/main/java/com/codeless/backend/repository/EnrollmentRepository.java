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
    
    /**
     * Count total enrollments for a specific course
     */
    long countByCourseId(Long courseId);
    
    /**
     * Get enrollment counts for multiple courses
     * Returns a map of courseId -> enrollmentCount
     */
    @Query("SELECT e.course.id, COUNT(e) FROM Enrollment e WHERE e.course.id IN :courseIds GROUP BY e.course.id")
    List<Object[]> countEnrollmentsByCourseIds(List<Long> courseIds);
}


