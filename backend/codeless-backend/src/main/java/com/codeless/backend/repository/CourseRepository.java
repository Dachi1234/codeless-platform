package com.codeless.backend.repository;

import com.codeless.backend.domain.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {
    
    /**
     * Get distinct categories from all published courses
     */
    @Query("SELECT DISTINCT c.category FROM Course c WHERE c.published = true AND c.category IS NOT NULL ORDER BY c.category")
    List<String> findDistinctCategories();
}


