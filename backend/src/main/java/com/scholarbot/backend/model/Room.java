package com.scholarbot.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "study_rooms")
public class Room {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    // Storing active room members as JSON list
    @Column(name = "members_json", length = 4000)
    private String membersJson = "[]";

    // Storing scrollable chat messages as JSON list
    @Column(name = "chat_json", length = 8000)
    private String chatJson = "[]";

    // Constructors
    public Room() {
    }

    public Room(String id, String name, String description, String membersJson, String chatJson) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.membersJson = membersJson;
        this.chatJson = chatJson;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMembersJson() {
        return membersJson;
    }

    public void setMembersJson(String membersJson) {
        this.membersJson = membersJson;
    }

    public String getChatJson() {
        return chatJson;
    }

    public void setChatJson(String chatJson) {
        this.chatJson = chatJson;
    }
}
