package com.scholarbot.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "focus_sessions")
public class FocusSession {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    private int duration;

    private String category;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(length = 2000)
    private String notes;

    private boolean completed;

    // Constructors
    public FocusSession() {
    }

    public FocusSession(String id, String userId, int duration, String category, String notes, boolean completed) {
        this.id = id;
        this.userId = userId;
        this.duration = duration;
        this.category = category;
        this.timestamp = LocalDateTime.now();
        this.notes = notes;
        this.completed = completed;
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

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
