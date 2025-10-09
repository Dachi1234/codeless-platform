package com.codeless.backend.web.api;

import com.codeless.backend.domain.ArticleContent;
import com.codeless.backend.repository.ArticleContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@io.swagger.v3.oas.annotations.tags.Tag(name = "Article Content", description = "View article content (public/student)")
@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleContentRepository articleContentRepository;

    @Data
    public static class ArticleContentViewDTO {
        private Long id;
        private String content;
        private Integer estimatedReadTime;

        public static ArticleContentViewDTO from(ArticleContent article) {
            ArticleContentViewDTO dto = new ArticleContentViewDTO();
            dto.setId(article.getId());
            dto.setContent(article.getContent());
            dto.setEstimatedReadTime(article.getEstimatedReadTime());
            return dto;
        }
    }

    // Get article content by lesson ID (public/student access)
    @GetMapping("/lesson/{lessonId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ArticleContentViewDTO> getByLessonId(@PathVariable Long lessonId) {
        return articleContentRepository.findByLessonId(lessonId)
                .map(article -> ResponseEntity.ok(ArticleContentViewDTO.from(article)))
                .orElse(ResponseEntity.notFound().build());
    }
}

