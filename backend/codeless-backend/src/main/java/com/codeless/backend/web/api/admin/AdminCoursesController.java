package com.codeless.backend.web.api.admin;

import com.codeless.backend.domain.Course;
import com.codeless.backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Admin - Courses", description = "Admin course management")
@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCoursesController {

    private final CourseRepository courseRepository;

    @Data
    public static class AdminCourseDTO {
        private Long id;
        private String title;
        private String slug;
        private String kind;
        private String category;
        private String level;
        private BigDecimal price;
        private Integer enrolledCount;
        private Boolean published;
        private String createdAt;

        public static AdminCourseDTO from(Course course) {
            AdminCourseDTO dto = new AdminCourseDTO();
            dto.setId(course.getId());
            dto.setTitle(course.getTitle());
            dto.setSlug(course.getSlug());
            dto.setKind(course.getKind() != null ? course.getKind().name() : null);
            dto.setCategory(course.getCategory());
            dto.setLevel(course.getLevel() != null ? course.getLevel().name() : null);
            dto.setPrice(course.getPrice());
            dto.setEnrolledCount(course.getEnrolledCount());
            dto.setPublished(course.getPublished());
            dto.setCreatedAt(course.getCreatedAt() != null ? course.getCreatedAt().toString() : null);
            return dto;
        }
    }

    @Data
    public static class CourseFormDTO {
        private String title;
        private String slug;
        private String description;
        private String kind;
        private String category;
        private String level;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private String instructorName;
        private String instructorTitle;
        private String instructorBio;
        private Integer durationHours;
        private Integer maxStudents;
        private OffsetDateTime startDate;
        private OffsetDateTime endDate;
        private Integer sessionCount;
        private Boolean published;
    }

    @GetMapping
    public ResponseEntity<List<AdminCourseDTO>> listCourses(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String kind,
            @RequestParam(required = false) String category
    ) {
        List<Course> courses = courseRepository.findAll();

        // Filter by query
        if (q != null && !q.isBlank()) {
            String lowerQ = q.toLowerCase();
            courses = courses.stream()
                    .filter(c -> c.getTitle().toLowerCase().contains(lowerQ) ||
                            (c.getDescription() != null && c.getDescription().toLowerCase().contains(lowerQ)))
                    .collect(Collectors.toList());
        }

        // Filter by kind
        if (kind != null && !kind.isBlank()) {
            try {
                Course.Kind kindEnum = Course.Kind.valueOf(kind.toUpperCase());
                courses = courses.stream()
                        .filter(c -> c.getKind() == kindEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Ignore invalid kind
            }
        }

        // Filter by category
        if (category != null && !category.isBlank()) {
            courses = courses.stream()
                    .filter(c -> category.equalsIgnoreCase(c.getCategory()))
                    .collect(Collectors.toList());
        }

        List<AdminCourseDTO> result = courses.stream()
                .map(AdminCourseDTO::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Course> createCourse(@RequestBody CourseFormDTO form) {
        Course course = new Course();
        mapFormToCourse(form, course);
        course.setEnrolledCount(0);
        course.setCreatedAt(OffsetDateTime.now());
        course.setUpdatedAt(OffsetDateTime.now());
        Course saved = courseRepository.save(course);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody CourseFormDTO form) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        mapFormToCourse(form, course);
        course.setUpdatedAt(OffsetDateTime.now());
        Course saved = courseRepository.save(course);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/publish")
    @Transactional
    public ResponseEntity<Void> togglePublish(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Boolean published = body.get("published");
        if (published != null) {
            course.setPublished(published);
            course.setUpdatedAt(OffsetDateTime.now());
            courseRepository.save(course);
        }

        return ResponseEntity.ok().build();
    }

    private void mapFormToCourse(CourseFormDTO form, Course course) {
        course.setTitle(form.getTitle());
        course.setSlug(form.getSlug());
        course.setDescription(form.getDescription());
        if (form.getKind() != null) {
            course.setKind(Course.Kind.valueOf(form.getKind()));
        }
        course.setCategory(form.getCategory());
        if (form.getLevel() != null) {
            course.setLevel(Course.Level.valueOf(form.getLevel()));
        }
        course.setPrice(form.getPrice());
        course.setOriginalPrice(form.getOriginalPrice());
        course.setInstructorName(form.getInstructorName());
        course.setInstructorTitle(form.getInstructorTitle());
        // Note: instructorBio removed as Course entity doesn't have this field
        course.setDurationHours(form.getDurationHours());
        course.setMaxStudents(form.getMaxStudents());
        // Convert OffsetDateTime to LocalDate if not null
        course.setStartDate(form.getStartDate() != null ? form.getStartDate().toLocalDate() : null);
        course.setEndDate(form.getEndDate() != null ? form.getEndDate().toLocalDate() : null);
        course.setSessionCount(form.getSessionCount());
        course.setPublished(form.getPublished() != null ? form.getPublished() : false);
    }
}

