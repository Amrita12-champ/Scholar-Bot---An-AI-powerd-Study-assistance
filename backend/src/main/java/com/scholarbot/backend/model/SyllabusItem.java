package com.scholarbot.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_items")
public class SyllabusItem {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    private String subject;

    private String chapter;

    private String topic;

    private String status; // "pending", "in_progress", "mastered"

    @Column(name = "last_reviewed")
    private LocalDateTime lastReviewed;

    // Constructors
    public SyllabusItem() {
    }

    public SyllabusItem(String id, String userId, String subject, String chapter, String topic, String status) {
        this.id = id;
        this.userId = userId;
        this.subject = subject;
        this.chapter = chapter;
        this.topic = topic;
        this.status = status != null ? status : "pending";
        this.lastReviewed = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getChapter() {
        return chapter;
    }

    public void setChapter(String chapter) {
        this.chapter = chapter;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastReviewed() {
        return lastReviewed;
    }

    public void setLastReviewed(LocalDateTime lastReviewed) {
        this.lastReviewed = lastReviewed;
    }
}
