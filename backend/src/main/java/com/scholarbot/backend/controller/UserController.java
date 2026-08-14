package com.scholarbot.backend.controller;

import com.scholarbot.backend.model.User;
import com.scholarbot.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api") // ✅ FIXED base routing prefix path
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {
    // Keep every single custom method endpoint body inside exactly the same!

    // Keep all the rest of your controller code exactly the same...

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
//
//    @PostMapping("/auth/login")
//    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
//        String email = payload.get("email");
//        String name = payload.get("name");
//
//        if (email == null || email.trim().isEmpty()) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
//        }
//
//        User user = userService.loginOrRegister(email, name);
//        return ResponseEntity.ok(user);
//    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId) {
        return userService.findById(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable String userId, @RequestBody Map<String, Object> updates) {
        return userService.findById(userId).map(user -> {
            if (updates.containsKey("name")) user.setName((String) updates.get("name"));
            if (updates.containsKey("avatar")) user.setAvatar((String) updates.get("avatar"));
            if (updates.containsKey("targetHours")) user.setTargetHours((Integer) updates.get("targetHours"));
            if (updates.containsKey("xp")) user.setXp((Integer) updates.get("xp"));
            if (updates.containsKey("studyPoints")) user.setStudyPoints((Integer) updates.get("studyPoints"));
            if (updates.containsKey("streak")) user.setStreak((Integer) updates.get("streak"));
            if (updates.containsKey("categoryTargetsJson")) user.setCategoryTargetsJson((String) updates.get("categoryTargetsJson"));

            User saved = userService.save(user);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
