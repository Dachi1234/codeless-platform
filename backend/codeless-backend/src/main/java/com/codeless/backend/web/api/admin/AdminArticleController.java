package com.codeless.backend.web.api.admin;

import com.codeless.backend.domain.ArticleContent;
import com.codeless.backend.domain.Lesson;
import com.codeless.backend.repository.ArticleContentRepository;
import com.codeless.backend.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Admin - Article Content", description = "Admin article content management")
@RestController
@RequestMapping("/api/admin/articles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminArticleController {

    private final ArticleContentRepository articleContentRepository;
    private final LessonRepository lessonRepository;

    @Data
    public static class ArticleContentDTO {
        private Long id;
        private Long lessonId;
        private String content;
        private String rawContent;
        private Integer estimatedReadTime;

        public static ArticleContentDTO from(ArticleContent article) {
            ArticleContentDTO dto = new ArticleContentDTO();
            dto.setId(article.getId());
            dto.setLessonId(article.getLesson().getId());
            dto.setContent(article.getContent());
            dto.setRawContent(article.getRawContent());
            dto.setEstimatedReadTime(article.getEstimatedReadTime());
            return dto;
        }
    }

    @Data
    public static class ArticleContentCreateDTO {
        private Long lessonId;
        private String content;
        private String rawContent;
        private Integer estimatedReadTime;
    }

    @Data
    public static class ArticleContentUpdateDTO {
        private String content;
        private String rawContent;
        private Integer estimatedReadTime;
    }

    // Get article content by lesson ID
    @GetMapping("/lesson/{lessonId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ArticleContentDTO> getByLessonId(@PathVariable Long lessonId) {
        return articleContentRepository.findByLessonId(lessonId)
                .map(article -> ResponseEntity.ok(ArticleContentDTO.from(article)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Create article content
    @PostMapping
    @Transactional
    public ResponseEntity<ArticleContentDTO> create(@RequestBody ArticleContentCreateDTO dto) {
        Lesson lesson = lessonRepository.findById(dto.getLessonId())
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        // Check if article already exists for this lesson
        if (articleContentRepository.findByLessonId(dto.getLessonId()).isPresent()) {
            throw new IllegalStateException("Article content already exists for this lesson");
        }

        ArticleContent article = new ArticleContent();
        article.setLesson(lesson);
        article.setContent(dto.getContent());
        article.setRawContent(dto.getRawContent());
        article.setEstimatedReadTime(dto.getEstimatedReadTime() != null ? 
                dto.getEstimatedReadTime() : calculateReadTime(dto.getContent()));
        article.setCreatedAt(OffsetDateTime.now());
        article.setUpdatedAt(OffsetDateTime.now());

        ArticleContent saved = articleContentRepository.save(article);
        return ResponseEntity.ok(ArticleContentDTO.from(saved));
    }

    // Update article content
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ArticleContentDTO> update(
            @PathVariable Long id,
            @RequestBody ArticleContentUpdateDTO dto
    ) {
        ArticleContent article = articleContentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));

        if (dto.getContent() != null) {
            article.setContent(dto.getContent());
            // Recalculate read time if content changed
            article.setEstimatedReadTime(dto.getEstimatedReadTime() != null ?
                    dto.getEstimatedReadTime() : calculateReadTime(dto.getContent()));
        }
        if (dto.getRawContent() != null) article.setRawContent(dto.getRawContent());
        article.setUpdatedAt(OffsetDateTime.now());

        ArticleContent saved = articleContentRepository.save(article);
        return ResponseEntity.ok(ArticleContentDTO.from(saved));
    }

    // Delete article content
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!articleContentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        articleContentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Helper: Calculate estimated read time based on word count
    // Average reading speed: 200-250 words per minute
    private Integer calculateReadTime(String content) {
        if (content == null || content.isEmpty()) {
            return 1;
        }
        // Strip HTML tags and count words
        String plainText = content.replaceAll("<[^>]*>", "");
        int wordCount = plainText.split("\\s+").length;
        int readTime = Math.max(1, (int) Math.ceil(wordCount / 200.0));
        return readTime;
    }
}

