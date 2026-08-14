package com.scholarbot.backend.service;

import com.scholarbot.backend.model.SyllabusItem;
import com.scholarbot.backend.repository.SyllabusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SyllabusService {

    private final SyllabusRepository syllabusRepository;

    @Autowired
    public SyllabusService(SyllabusRepository syllabusRepository) {
        this.syllabusRepository = syllabusRepository;
    }

    public List<SyllabusItem> getSyllabusForUser(String userId) {
        return syllabusRepository.findByUserIdOrUserId(userId, "any");
    }

    public SyllabusItem createItem(String userId, String subject, String chapter, String topic, String status) {
        String id = "topic-" + UUID.randomUUID().toString().substring(0, 8);
        SyllabusItem item = new SyllabusItem(id, userId, subject, chapter, topic, status);
        return syllabusRepository.save(item);
    }

    public Optional<SyllabusItem> updateItem(String id, SyllabusItem updatedData) {
        return syllabusRepository.findById(id).map(item -> {
            if (updatedData.getSubject() != null) item.setSubject(updatedData.getSubject());
            if (updatedData.getChapter() != null) item.setChapter(updatedData.getChapter());
            if (updatedData.getTopic() != null) item.setTopic(updatedData.getTopic());
            if (updatedData.getStatus() != null) item.setStatus(updatedData.getStatus());
            item.setLastReviewed(LocalDateTime.now());
            return syllabusRepository.save(item);
        });
    }

    public void deleteItem(String id) {
        syllabusRepository.deleteById(id);
    }
}
