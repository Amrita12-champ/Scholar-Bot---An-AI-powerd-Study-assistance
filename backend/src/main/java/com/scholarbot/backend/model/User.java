package com.scholarbot.backend.model;
import jakarta.persistence.GeneratedValue;

import jakarta.persistence.GenerationType;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {
    // Inside com/scholarbot/backend/model/User.java

    @Column(name = "password_hash", nullable = true)
    private String passwordHash;

    @Column(name = "is_registered", nullable = false)
    private Boolean isRegistered = false; // defaults to false for new rows

    // --- Add your Getters and Setters here ---
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Boolean getIsRegistered() { return isRegistered; }
    public void setIsRegistered(Boolean isRegistered) { this.isRegistered = isRegistered; }
// Inside User.java

    // Inside User.java
    @Id
    @Column(name = "id")
    private String id;
    // Enforce String type matching your 'character varying' column
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String avatar;

    private int level = 1;

    private int xp = 0;

    @Column(name = "study_points")
    private int studyPoints = 0;

    private int streak = 1;

    @Column(name = "last_study_date")
    private LocalDate lastStudyDate;

    @Column(name = "target_hours")
    private int targetHours = 4;

    // We can store category targets as a simple comma-separated string or a JSON payload.
    // To minimize tight coupling and database complexity, we use a single string representation.
    @Column(name = "category_targets_json", length = 1000)
    private String categoryTargetsJson = "{\"Mathematics\":60,\"Physics\":60,\"Computer Science\":60,\"Language\":30,\"Other\":30}";

    // Constructors
    public User() {
    }

    public User(String id, String name, String email, String avatar) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar;
        this.level = 1;
        this.xp = 0;
        this.studyPoints = 0;
        this.streak = 1;
        this.lastStudyDate = LocalDate.now();
        this.targetHours = 4;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getStudyPoints() {
        return studyPoints;
    }

    public void setStudyPoints(int studyPoints) {
        this.studyPoints = studyPoints;
    }

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public LocalDate getLastStudyDate() {
        return lastStudyDate;
    }

    public void setLastStudyDate(LocalDate lastStudyDate) {
        this.lastStudyDate = lastStudyDate;
    }

    public int getTargetHours() {
        return targetHours;
    }

    public void setTargetHours(int targetHours) {
        this.targetHours = targetHours;
    }

    public String getCategoryTargetsJson() {
        return categoryTargetsJson;
    }

    public void setCategoryTargetsJson(String categoryTargetsJson) {
        this.categoryTargetsJson = categoryTargetsJson;
    }
}
