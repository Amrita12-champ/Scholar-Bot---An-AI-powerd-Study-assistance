package com.scholarbot.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
public class Exam {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String title;

    private LocalDateTime date;

    private String subject;

    @Column(name = "preparation_level")
    private int preparationLevel = 50;

    // We store the checklist tasks as a JSON string, decoupling the tables completely.
    @Column(name = "tasks_json", length = 3000)
    private String tasksJson = "[]";

    // Constructors
    public Exam() {
    }

    public Exam(String id, String userId, String title, LocalDateTime date, String subject, int preparationLevel) {
        this.id = id;
        this.userId = userId;
        this.title = title != null ? title : "New Exam";
        this.date = date != null ? date : LocalDateTime.now().plusDays(7);
        this.subject = subject != null ? subject : "Other";
        this.preparationLevel = preparationLevel;
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

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getPreparationLevel() {
        return preparationLevel;
    }

    public void setPreparationLevel(int preparationLevel) {
        this.preparationLevel = preparationLevel;
    }

    public String getTasksJson() {
        return tasksJson;
    }

    public void setTasksJson(String tasksJson) {
        this.tasksJson = tasksJson;
    }
}
