package com.codeless.backend.web.api;

import com.codeless.backend.service.CurriculumService;
import com.codeless.backend.web.api.dto.CurriculumDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Curriculum", description = "Course curriculum and lesson progress APIs")
@SecurityRequirement(name = "bearerAuth")
public class CurriculumController {
    
    private final CurriculumService curriculumService;
    
    @GetMapping("/courses/{courseId}/curriculum")
    @Operation(summary = "Get course curriculum", description = "Fetch all sections and lessons for a course with user's progress")
    public ResponseEntity<CurriculumDTO.CurriculumResponse> getCurriculum(
            @PathVariable Long courseId,
            Authentication auth) {
        
        CurriculumDTO.CurriculumResponse curriculum = curriculumService.getCurriculum(courseId, auth.getName());
        return ResponseEntity.ok(curriculum);
    }
    
    @PostMapping("/lessons/{lessonId}/complete")
    @Operation(summary = "Mark lesson as complete", description = "Mark a lesson as completed and update progress")
    public ResponseEntity<CurriculumDTO.LessonCompleteResponse> markLessonComplete(
            @PathVariable Long lessonId,
            @RequestBody @Valid CurriculumDTO.LessonCompleteRequest request,
            Authentication auth) {
        
        CurriculumDTO.LessonCompleteResponse response = curriculumService.markLessonComplete(
                lessonId, 
                auth.getName(), 
                request
        );
        return ResponseEntity.ok(response);
    }
}

