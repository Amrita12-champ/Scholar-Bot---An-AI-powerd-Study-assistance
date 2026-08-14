package com.scholarbot.backend.repository;

import com.scholarbot.backend.model.FocusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, String> {
    List<FocusSession> findByUserIdOrUserId(String userId, String fallbackUserId);
}
