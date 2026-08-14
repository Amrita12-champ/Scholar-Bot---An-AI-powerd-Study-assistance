package com.scholarbot.backend.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    private String id;

    // Inside your Note class, change your userId declaration to this:
    @Column(name = "user_id", nullable = false)
    @JsonProperty("userId") // Explicit mapping alignment
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(length = 4000)
    private String summary;

    private String category;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    // We store flashcards as a JSON array string to avoid complex database joins,
    // ensuring low-coupling and maximum performance.
    @Column(name = "flashcards_json", length = 5000)
    private String flashcardsJson = "[]";

    // Constructors
    public Note() {
    }

    public Note(String id, String userId, String title, String content, String category) {
        this.id = id;
        this.userId = userId;
        this.title = title != null ? title : "Untitled Note";
        this.content = content != null ? content : "";
        this.category = category != null ? category : "Other";
        this.timestamp = LocalDateTime.now();
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
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

    public String getFlashcardsJson() {
        return flashcardsJson;
    }

    public void setFlashcardsJson(String flashcardsJson) {
        this.flashcardsJson = flashcardsJson;
    }
}