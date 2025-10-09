package com.codeless.backend.repository;

import com.codeless.backend.domain.ArticleContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArticleContentRepository extends JpaRepository<ArticleContent, Long> {
    Optional<ArticleContent> findByLessonId(Long lessonId);
    void deleteByLessonId(Long lessonId);
}

