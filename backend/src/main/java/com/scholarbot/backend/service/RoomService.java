package com.scholarbot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.scholarbot.backend.model.Room;
import com.scholarbot.backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Optional<Room> joinRoom(String roomId, String userId, String userName, String avatar, int xp) {
        List<Room> allRooms = roomRepository.findAll();

        // 1. Remove member from other rooms to avoid double-logging status
        for (Room r : allRooms) {
            try {
                ArrayNode members = (ArrayNode) objectMapper.readTree(r.getMembersJson());
                boolean modified = false;
                for (int i = 0; i < members.size(); i++) {
                    if (members.get(i).path("userId").asText().equals(userId)) {
                        members.remove(i);
                        modified = true;
                        break;
                    }
                }
                if (modified) {
                    r.setMembersJson(objectMapper.writeValueAsString(members));
                    roomRepository.save(r);
                }
            } catch (Exception e) {
                System.err.println("Failed to clean up room member: " + e.getMessage());
            }
        }

        // 2. Add member to specified room
        Optional<Room> targetRoomOpt = roomRepository.findById(roomId);
        if (targetRoomOpt.isEmpty()) {
            return Optional.empty();
        }

        Room targetRoom = targetRoomOpt.get();
        try {
            ArrayNode members = (ArrayNode) objectMapper.readTree(targetRoom.getMembersJson());
            ObjectNode newMember = objectMapper.createObjectNode();
            newMember.put("userId", userId);
            newMember.put("userName", userName);
            newMember.put("avatar", avatar != null ? avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=" + userName);
            newMember.put("xp", xp);
            newMember.put("currentActivity", "Focusing (In Room)");

            members.add(newMember);
            targetRoom.setMembersJson(objectMapper.writeValueAsString(members));
            return Optional.of(roomRepository.save(targetRoom));
        } catch (Exception e) {
            System.err.println("Failed to join room: " + e.getMessage());
            return Optional.of(targetRoom);
        }
    }

    public Optional<Room> addChatMessage(String roomId, String userName, String text) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (roomOpt.isEmpty()) {
            return Optional.empty();
        }

        Room room = roomOpt.get();
        try {
            ArrayNode chat = (ArrayNode) objectMapper.readTree(room.getChatJson());
            ObjectNode newMsg = objectMapper.createObjectNode();
            newMsg.put("id", "msg-" + UUID.randomUUID().toString().substring(0, 8));
            newMsg.put("userName", userName != null ? userName : "Anonymous Scholar");
            newMsg.put("text", text);
            newMsg.put("timestamp", LocalDateTime.now().toString());

            chat.add(newMsg);

            // Cap chats to latest 30 messages
            if (chat.size() > 30) {
                chat.remove(0);
            }

            room.setChatJson(objectMapper.writeValueAsString(chat));
            return Optional.of(roomRepository.save(room));
        } catch (Exception e) {
            System.err.println("Failed to write room chat: " + e.getMessage());
            return Optional.of(room);
        }
    }
}
