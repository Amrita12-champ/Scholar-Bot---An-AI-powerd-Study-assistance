package com.scholarbot.backend.controller;

import com.scholarbot.backend.model.Room;
import com.scholarbot.backend.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RoomController {

    private final RoomService roomService;

    @Autowired
    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @PostMapping("/rooms/{roomId}/join")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId, @RequestBody Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String avatar = (String) payload.get("avatar");
        int xp = payload.containsKey("xp") ? (int) payload.get("xp") : 0;

        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }

        return roomService.joinRoom(roomId, userId, userName, avatar, xp)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/rooms/{roomId}/chat")
    public ResponseEntity<?> addChatMessage(@PathVariable String roomId, @RequestBody Map<String, String> payload) {
        String userName = payload.get("userName");
        String text = payload.get("text");

        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "text is required"));
        }

        return roomService.addChatMessage(roomId, userName, text)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
