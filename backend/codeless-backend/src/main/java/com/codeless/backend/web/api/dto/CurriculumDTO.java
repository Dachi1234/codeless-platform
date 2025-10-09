package com.codeless.backend.web.api.dto;

import com.codeless.backend.domain.CourseSection;
import com.codeless.backend.domain.Lesson;
import com.codeless.backend.domain.LessonProgress;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CurriculumDTO {
    
    public record CurriculumResponse(
            List<SectionDTO> sections
    ) {}
    
    public record SectionDTO(
            Long id,
            String title,
            String description,
            Integer sectionOrder,
            List<LessonDTO> lessons
    ) {
        public static SectionDTO from(CourseSection section, Map<Long, LessonProgress> progressMap) {
            List<LessonDTO> lessons = section.getLessons().stream()
                    .map(lesson -> LessonDTO.from(lesson, progressMap.get(lesson.getId())))
                    .collect(Collectors.toList());
            
            return new SectionDTO(
                    section.getId(),
                    section.getTitle(),
                    section.getDescription(),
                    section.getSectionOrder(),
                    lessons
            );
        }
    }
    
    public record LessonDTO(
            Long id,
            String title,
            String description,
            String lessonType,
            String contentUrl,
            Integer durationMinutes,
            Integer lessonOrder,
            Boolean isPreview,
            Boolean completed,
            Integer lastPositionSeconds,
            Integer timeSpentSeconds
    ) {
        public static LessonDTO from(Lesson lesson, LessonProgress progress) {
            return new LessonDTO(
                    lesson.getId(),
                    lesson.getTitle(),
                    lesson.getDescription(),
                    lesson.getLessonType().name(),
                    lesson.getContentUrl(),
                    lesson.getDurationMinutes(),
                    lesson.getLessonOrder(),
                    lesson.getIsPreview(),
                    progress != null && progress.getCompleted(),
                    progress != null ? progress.getLastPositionSeconds() : 0,
                    progress != null ? progress.getTimeSpentSeconds() : 0
            );
        }
    }
    
    public record LessonCompleteRequest(
            Integer positionSeconds,
            Integer timeSpentSeconds
    ) {}
    
    public record LessonCompleteResponse(
            Long lessonId,
            Boolean completed,
            String message
    ) {}
}

