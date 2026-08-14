package com.scholarbot.backend.repository;

import com.scholarbot.backend.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, String> {
    List<Exam> findByUserIdOrUserId(String userId, String fallbackUserId);
}
