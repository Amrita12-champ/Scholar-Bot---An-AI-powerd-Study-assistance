package com.scholarbot.backend.repository;

import com.scholarbot.backend.model.SyllabusItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusRepository extends JpaRepository<SyllabusItem, String> {
    List<SyllabusItem> findByUserIdOrUserId(String userId, String fallbackUserId);
}
