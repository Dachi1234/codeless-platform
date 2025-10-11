package com.codeless.backend.service;

import com.codeless.backend.domain.Course;
import com.codeless.backend.domain.LiveSession;
import com.codeless.backend.repository.CourseRepository;
import com.codeless.backend.repository.LiveSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveSessionService {

    private final LiveSessionRepository sessionRepository;
    private final CourseRepository courseRepository;

    /**
     * Get all sessions for a course
     */
    public List<LiveSession> getSessionsForCourse(Long courseId) {
        return sessionRepository.findByCourseIdOrderBySessionNumberAsc(courseId);
    }

    /**
     * Get a single session by ID
     */
    public LiveSession getSession(Long id) {
        return sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Session not found with id: " + id));
    }

    /**
     * Create a new session
     */
    @Transactional
    public LiveSession createSession(Long courseId, LiveSession session) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Ensure course is LIVE type
        if (course.getKind() != Course.Kind.LIVE) {
            throw new IllegalArgumentException("Cannot add live sessions to non-live courses");
        }

        session.setCourse(course);
        
        // Auto-set session number if not provided
        if (session.getSessionNumber() == null) {
            long count = sessionRepository.countByCourseId(courseId);
            session.setSessionNumber((int) count + 1);
        }

        // Set default status
        if (session.getStatus() == null) {
            session.setStatus(LiveSession.SessionStatus.SCHEDULED);
        }

        log.info("Creating session {} for course {}", session.getTitle(), courseId);
        return sessionRepository.save(session);
    }

    /**
     * Update a session
     */
    @Transactional
    public LiveSession updateSession(Long id, LiveSession updatedSession) {
        LiveSession existing = getSession(id);
        
        existing.setTitle(updatedSession.getTitle());
        existing.setDescription(updatedSession.getDescription());
        existing.setScheduledAt(updatedSession.getScheduledAt());
        existing.setDurationMinutes(updatedSession.getDurationMinutes());
        existing.setZoomLink(updatedSession.getZoomLink());
        existing.setStatus(updatedSession.getStatus());
        existing.setRecordingUrl(updatedSession.getRecordingUrl());
        
        log.info("Updating session {}", id);
        return sessionRepository.save(existing);
    }

    /**
     * Delete a session
     */
    @Transactional
    public void deleteSession(Long id) {
        log.info("Deleting session {}", id);
        sessionRepository.deleteById(id);
    }

    /**
     * Get next upcoming session for a course
     */
    public LiveSession getNextSession(Long courseId) {
        List<LiveSession> sessions = sessionRepository.findNextSessionsForCourse(
            courseId, 
            OffsetDateTime.now()
        );
        return sessions.isEmpty() ? null : sessions.get(0);
    }

    /**
     * Get all upcoming sessions
     */
    public List<LiveSession> getUpcomingSessions() {
        return sessionRepository.findUpcomingSessions(OffsetDateTime.now());
    }

    /**
     * Update session status (e.g., SCHEDULED -> LIVE -> COMPLETED)
     */
    @Transactional
    public void updateSessionStatus(Long id, LiveSession.SessionStatus status) {
        LiveSession session = getSession(id);
        session.setStatus(status);
        sessionRepository.save(session);
        log.info("Updated session {} status to {}", id, status);
    }
}

