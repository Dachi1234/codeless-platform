package com.codeless.backend.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Entity
@Table(name = "article_content")
@Data
public class ArticleContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false, unique = true)
    private Lesson lesson;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // HTML content from TinyMCE

    @Column(name = "raw_content", columnDefinition = "TEXT")
    private String rawContent; // Optional: Markdown or plain text backup

    @Column(name = "estimated_read_time")
    private Integer estimatedReadTime; // Minutes

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}

