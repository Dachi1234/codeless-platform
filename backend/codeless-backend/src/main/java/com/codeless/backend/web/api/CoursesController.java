package com.codeless.backend.web.api;

import com.codeless.backend.domain.Course;
import com.codeless.backend.repository.CourseRepository;
import com.codeless.backend.web.api.dto.CourseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CoursesController {

    private final CourseRepository courseRepository;

    public CoursesController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @io.swagger.v3.oas.annotations.Operation(
            summary = "List courses with pagination and optional filters",
            description = "Supports q (search in title/description), kind, category, level, price range, and sort"
    )
    @GetMapping
    public ResponseEntity<Page<CourseDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String kind,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        // Limit page size to prevent abuse
        if (size > 100) size = 100;
        
        // Handle sorting with special case for rating (nulls should be last)
        Sort by;
        String[] s = sort.split(",");
        
        // Build specification first
        Specification<Course> spec = Specification.where((root, cq, cb) -> 
            cb.equal(root.get("published"), true)
        );
        
        // Handle rating sort specially with manual ordering in the specification
        if (s.length == 2 && "rating".equals(s[0])) {
            Sort.Direction direction = Sort.Direction.fromString(s[1]);
            final boolean desc = direction == Sort.Direction.DESC;
            
            // Add custom ordering that handles nulls properly
            spec = spec.and((root, query, cb) -> {
                // Use COALESCE to replace nulls with -1 for DESC (so they sort last)
                // or with 999 for ASC (so they sort last)
                jakarta.persistence.criteria.Expression<Number> ratingExpr = desc 
                    ? cb.coalesce(root.get("rating"), -1)
                    : cb.coalesce(root.get("rating"), 999);
                    
                if (desc) {
                    query.orderBy(cb.desc(ratingExpr), cb.asc(root.get("title")));
                } else {
                    query.orderBy(cb.asc(ratingExpr), cb.asc(root.get("title")));
                }
                return null; // This spec doesn't add WHERE conditions, just ORDER BY
            });
            by = Sort.unsorted(); // Don't use Pageable sorting, we handle it in spec
        } else {
            // Default sorting
            by = s.length == 2 ? Sort.by(Sort.Direction.fromString(s[1]), s[0]) : Sort.by(s[0]);
        }
        
        Pageable pageable = PageRequest.of(page, size, by);
        
        if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase() + "%";
            spec = spec.and((root, cq, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("description")), like)
            ));
        }
        if (kind != null && !kind.isBlank()) {
            try {
                Course.Kind kindEnum = Course.Kind.valueOf(kind.toUpperCase());
                spec = spec.and((root, cq, cb) -> cb.equal(root.get("kind"), kindEnum));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid kind value: " + kind + ". Must be one of: LIVE, PRE_RECORDED, BUNDLE");
            }
        }
        if (category != null && !category.isBlank()) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("category"), category));
        }
        if (level != null && !level.isBlank()) {
            try {
                Course.Level levelEnum = Course.Level.valueOf(level.toUpperCase());
                spec = spec.and((root, cq, cb) -> cb.equal(root.get("level"), levelEnum));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid level value: " + level + ". Must be one of: BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS");
            }
        }
        if (minPrice != null) {
            spec = spec.and((root, cq, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, cq, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
        Page<CourseDTO> result = courseRepository.findAll(spec, pageable).map(CourseDTO::from);
        return ResponseEntity.ok(result);
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Get course details by id")
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> details(@PathVariable("id") Long id) {
        return courseRepository.findById(id)
                .filter(course -> course.getPublished() != null && course.getPublished()) // Only show published courses
                .map(CourseDTO::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @io.swagger.v3.oas.annotations.Operation(
            summary = "Get distinct course categories",
            description = "Returns a list of all unique course categories from published courses"
    )
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = courseRepository.findDistinctCategories();
        return ResponseEntity.ok(categories);
    }
}


