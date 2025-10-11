package com.codeless.backend.repository;

import com.codeless.backend.domain.LiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface LiveSessionRepository extends JpaRepository<LiveSession, Long> {

    /**
     * Find all sessions for a specific course, ordered by session number
     * Using JOIN FETCH to avoid LazyInitializationException
     */
    @Query("SELECT s FROM LiveSession s JOIN FETCH s.course WHERE s.course.id = :courseId ORDER BY s.sessionNumber ASC")
    List<LiveSession> findByCourseIdOrderBySessionNumberAsc(@Param("courseId") Long courseId);

    /**
     * Find sessions by status
     */
    List<LiveSession> findByStatusOrderByScheduledAtAsc(LiveSession.SessionStatus status);

    /**
     * Find upcoming sessions (scheduled after now)
     */
    @Query("SELECT s FROM LiveSession s WHERE s.scheduledAt > :now AND s.status = 'SCHEDULED' ORDER BY s.scheduledAt ASC")
    List<LiveSession> findUpcomingSessions(@Param("now") OffsetDateTime now);

    /**
     * Find next session for a specific course
     */
    @Query("SELECT s FROM LiveSession s WHERE s.course.id = :courseId AND s.scheduledAt > :now AND s.status = 'SCHEDULED' ORDER BY s.scheduledAt ASC")
    List<LiveSession> findNextSessionsForCourse(@Param("courseId") Long courseId, @Param("now") OffsetDateTime now);

    /**
     * Count sessions for a course
     */
    long countByCourseId(Long courseId);

    /**
     * Delete all sessions for a course
     */
    void deleteByCourseId(Long courseId);
}

