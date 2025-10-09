package com.codeless.backend.repository;

import com.codeless.backend.domain.LearningStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearningStreakRepository extends JpaRepository<LearningStreak, Long> {
    Optional<LearningStreak> findByUserId(Long userId);
}

