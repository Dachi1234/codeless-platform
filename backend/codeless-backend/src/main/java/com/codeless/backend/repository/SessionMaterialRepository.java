package com.codeless.backend.repository;

import com.codeless.backend.domain.SessionMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionMaterialRepository extends JpaRepository<SessionMaterial, Long> {

    /**
     * Find all materials for a specific session
     */
    List<SessionMaterial> findByLiveSessionIdOrderByUploadedAtDesc(Long liveSessionId);

    /**
     * Count materials for a session
     */
    long countByLiveSessionId(Long liveSessionId);

    /**
     * Delete all materials for a session
     */
    void deleteByLiveSessionId(Long liveSessionId);
}

