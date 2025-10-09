package com.codeless.backend.web.api.admin;

import com.codeless.backend.domain.Course;
import com.codeless.backend.domain.CourseSection;
import com.codeless.backend.domain.Lesson;
import com.codeless.backend.repository.CourseSectionRepository;
import com.codeless.backend.repository.CourseRepository;
import com.codeless.backend.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Admin - Curriculum", description = "Admin curriculum management")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCurriculumController {

    private final CourseRepository courseRepository;
    private final CourseSectionRepository sectionRepository;
    private final LessonRepository lessonRepository;

    // ============== SECTION DTOs ==============
    
    @Data
    public static class SectionCreateDTO {
        private String title;
        private String description;
        private Integer sectionOrder;
    }

    @Data
    public static class SectionUpdateDTO {
        private String title;
        private String description;
        private Integer sectionOrder;
    }

    @Data
    public static class SectionReorderDTO {
        private Integer newOrder;
    }

    // ============== LESSON DTOs ==============
    
    @Data
    public static class LessonCreateDTO {
        private String title;
        private String description;
        private String lessonType; // VIDEO, ARTICLE, QUIZ, EXERCISE
        private String contentUrl;
        private Integer durationMinutes;
        private Integer lessonOrder;
        private Boolean isPreview;
    }

    @Data
    public static class LessonUpdateDTO {
        private String title;
        private String description;
        private String lessonType;
        private String contentUrl;
        private Integer durationMinutes;
        private Integer lessonOrder;
        private Boolean isPreview;
    }

    @Data
    public static class LessonReorderDTO {
        private Integer newOrder;
    }

    @Data
    public static class LessonResponseDTO {
        private Long id;
        private String title;
        private String description;
        private String lessonType;
        private String contentUrl;
        private Integer durationMinutes;
        private Integer lessonOrder;
        private Boolean isPreview;

        public static LessonResponseDTO from(Lesson lesson) {
            LessonResponseDTO dto = new LessonResponseDTO();
            dto.setId(lesson.getId());
            dto.setTitle(lesson.getTitle());
            dto.setDescription(lesson.getDescription());
            dto.setLessonType(lesson.getLessonType().name());
            dto.setContentUrl(lesson.getContentUrl());
            dto.setDurationMinutes(lesson.getDurationMinutes());
            dto.setLessonOrder(lesson.getLessonOrder());
            dto.setIsPreview(lesson.getIsPreview());
            return dto;
        }
    }

    @Data
    public static class SectionResponseDTO {
        private Long id;
        private String title;
        private String description;
        private Integer sectionOrder;

        public static SectionResponseDTO from(CourseSection section) {
            SectionResponseDTO dto = new SectionResponseDTO();
            dto.setId(section.getId());
            dto.setTitle(section.getTitle());
            dto.setDescription(section.getDescription());
            dto.setSectionOrder(section.getSectionOrder());
            return dto;
        }
    }

    // ============== SECTION ENDPOINTS ==============

    @PostMapping("/courses/{courseId}/sections")
    @Transactional
    public ResponseEntity<SectionResponseDTO> createSection(
            @PathVariable Long courseId,
            @RequestBody SectionCreateDTO dto
    ) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        CourseSection section = new CourseSection();
        section.setCourse(course);
        section.setTitle(dto.getTitle());
        section.setDescription(dto.getDescription());
        section.setSectionOrder(dto.getSectionOrder() != null ? dto.getSectionOrder() : getNextSectionOrder(courseId));
        section.setCreatedAt(OffsetDateTime.now());
        section.setUpdatedAt(OffsetDateTime.now());

        CourseSection saved = sectionRepository.save(section);
        return ResponseEntity.ok(SectionResponseDTO.from(saved));
    }

    @PutMapping("/sections/{sectionId}")
    @Transactional
    public ResponseEntity<SectionResponseDTO> updateSection(
            @PathVariable Long sectionId,
            @RequestBody SectionUpdateDTO dto
    ) {
        CourseSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));

        if (dto.getTitle() != null) section.setTitle(dto.getTitle());
        if (dto.getDescription() != null) section.setDescription(dto.getDescription());
        if (dto.getSectionOrder() != null) section.setSectionOrder(dto.getSectionOrder());
        section.setUpdatedAt(OffsetDateTime.now());

        CourseSection saved = sectionRepository.save(section);
        return ResponseEntity.ok(SectionResponseDTO.from(saved));
    }

    @DeleteMapping("/sections/{sectionId}")
    @Transactional
    public ResponseEntity<Void> deleteSection(@PathVariable Long sectionId) {
        if (!sectionRepository.existsById(sectionId)) {
            return ResponseEntity.notFound().build();
        }
        sectionRepository.deleteById(sectionId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/sections/{sectionId}/reorder")
    @Transactional
    public ResponseEntity<Void> reorderSection(
            @PathVariable Long sectionId,
            @RequestBody SectionReorderDTO dto
    ) {
        CourseSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));

        section.setSectionOrder(dto.getNewOrder());
        section.setUpdatedAt(OffsetDateTime.now());
        sectionRepository.save(section);

        return ResponseEntity.ok().build();
    }

    // ============== LESSON ENDPOINTS ==============

    @PostMapping("/sections/{sectionId}/lessons")
    @Transactional
    public ResponseEntity<LessonResponseDTO> createLesson(
            @PathVariable Long sectionId,
            @RequestBody LessonCreateDTO dto
    ) {
        CourseSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));

        // Determine lesson order - if not provided, calculate next available
        Integer lessonOrder = dto.getLessonOrder();
        if (lessonOrder == null) {
            lessonOrder = getNextLessonOrder(sectionId);
        }

        // Log for debugging
        System.out.println("Creating lesson in section " + sectionId + " with order " + lessonOrder);

        Lesson lesson = new Lesson();
        lesson.setSection(section);
        lesson.setTitle(dto.getTitle());
        lesson.setDescription(dto.getDescription());
        lesson.setLessonType(Lesson.LessonType.valueOf(dto.getLessonType()));
        lesson.setContentUrl(dto.getContentUrl());
        lesson.setDurationMinutes(dto.getDurationMinutes());
        lesson.setLessonOrder(lessonOrder);
        lesson.setIsPreview(dto.getIsPreview() != null ? dto.getIsPreview() : false);
        lesson.setCreatedAt(OffsetDateTime.now());
        lesson.setUpdatedAt(OffsetDateTime.now());

        try {
            Lesson saved = lessonRepository.save(lesson);
            return ResponseEntity.ok(LessonResponseDTO.from(saved));
        } catch (Exception e) {
            System.err.println("Error saving lesson: " + e.getMessage());
            System.err.println("Calculated next order for section " + sectionId + ": " + getNextLessonOrder(sectionId));
            throw e;
        }
    }

    @PutMapping("/lessons/{lessonId}")
    @Transactional
    public ResponseEntity<LessonResponseDTO> updateLesson(
            @PathVariable Long lessonId,
            @RequestBody LessonUpdateDTO dto
    ) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        if (dto.getTitle() != null) lesson.setTitle(dto.getTitle());
        if (dto.getDescription() != null) lesson.setDescription(dto.getDescription());
        if (dto.getLessonType() != null) lesson.setLessonType(Lesson.LessonType.valueOf(dto.getLessonType()));
        if (dto.getContentUrl() != null) lesson.setContentUrl(dto.getContentUrl());
        if (dto.getDurationMinutes() != null) lesson.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getLessonOrder() != null) lesson.setLessonOrder(dto.getLessonOrder());
        if (dto.getIsPreview() != null) lesson.setIsPreview(dto.getIsPreview());
        lesson.setUpdatedAt(OffsetDateTime.now());

        Lesson saved = lessonRepository.save(lesson);
        return ResponseEntity.ok(LessonResponseDTO.from(saved));
    }

    @DeleteMapping("/lessons/{lessonId}")
    @Transactional
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        if (!lessonRepository.existsById(lessonId)) {
            return ResponseEntity.notFound().build();
        }
        lessonRepository.deleteById(lessonId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/lessons/{lessonId}/reorder")
    @Transactional
    public ResponseEntity<Void> reorderLesson(
            @PathVariable Long lessonId,
            @RequestBody LessonReorderDTO dto
    ) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        lesson.setLessonOrder(dto.getNewOrder());
        lesson.setUpdatedAt(OffsetDateTime.now());
        lessonRepository.save(lesson);

        return ResponseEntity.ok().build();
    }

    // ============== HELPER METHODS ==============

    private Integer getNextSectionOrder(Long courseId) {
        return sectionRepository.findMaxSectionOrderByCourseId(courseId)
                .map(max -> max + 1)
                .orElse(1);
    }

    private Integer getNextLessonOrder(Long sectionId) {
        return lessonRepository.findMaxLessonOrderBySectionId(sectionId)
                .map(max -> max + 1)
                .orElse(1);
    }
}

