package com.codeless.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Entity representing a live session (Zoom meeting) within a live course.
 */
@Entity
@Table(name = "live_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    @Column(name = "session_number", nullable = false)
    private Integer sessionNumber;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "scheduled_at", nullable = false)
    private OffsetDateTime scheduledAt;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 90;

    @Column(name = "zoom_link", length = 500)
    private String zoomLink;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private SessionStatus status = SessionStatus.SCHEDULED;

    @Column(name = "recording_url", length = 500)
    private String recordingUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public enum SessionStatus {
        SCHEDULED,  // Future session, not started yet
        LIVE,       // Currently happening
        COMPLETED,  // Ended
        CANCELLED   // Cancelled by instructor
    }
}

