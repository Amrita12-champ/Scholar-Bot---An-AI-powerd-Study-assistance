package com.scholarbot.backend.controller;

import com.scholarbot.backend.model.FocusSession;
import com.scholarbot.backend.model.User;
import com.scholarbot.backend.service.FocusService;
import com.scholarbot.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FocusController {

    private final FocusService focusService;
    private final UserService userService;

    @Autowired
    public FocusController(FocusService focusService, UserService userService) {
        this.focusService = focusService;
        this.userService = userService;
    }

    @GetMapping("/focus/sessions/{userId}")
    public ResponseEntity<List<FocusSession>> getFocusSessions(@PathVariable String userId) {
        List<FocusSession> sessions = focusService.getSessionsForUser(userId);
        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/focus/sessions")
    public ResponseEntity<?> addFocusSession(@RequestBody Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        int duration = (int) payload.get("duration");
        String category = (String) payload.get("category");
        String notes = (String) payload.get("notes");
        boolean completed = (boolean) payload.get("completed");

        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }

        FocusSession session = focusService.createSession(userId, duration, category, notes, completed);
        User updatedUser = userService.findById(userId).orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("session", session);
        response.put("updatedUser", updatedUser);

        return ResponseEntity.ok(response);
    }
}
