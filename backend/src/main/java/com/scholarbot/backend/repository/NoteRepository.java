package com.scholarbot.backend.repository;

import com.scholarbot.backend.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, String> {

    // 🧠 Automatically maps to an SQL query: WHERE user_id = ? OR user_id = ?
    List<Note> findByUserIdOrUserId(String userId1, String userId2);

    // Keeps support for your standard singular user retrieval
    List<Note> findByUserId(String userId);
}