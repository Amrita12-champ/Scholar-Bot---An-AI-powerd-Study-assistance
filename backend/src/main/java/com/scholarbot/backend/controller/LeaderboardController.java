package com.scholarbot.backend.controller;

import com.scholarbot.backend.model.User;
import com.scholarbot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class LeaderboardController {

    private final UserRepository userRepository;

    @Autowired
    public LeaderboardController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/leaderboards")
    public ResponseEntity<?> getLeaderboard() {
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> rankedList = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("userId", u.getId());
            entry.put("userName", u.getName());
            entry.put("avatar", u.getAvatar());
            entry.put("xp", u.getXp());
            entry.put("streak", u.getStreak());
            rankedList.add(entry);
        }

        // Sort descending by XP
        rankedList.sort((a, b) -> Integer.compare((Integer) b.get("xp"), (Integer) a.get("xp")));

        // Assign ranks (1-indexed)
        List<Map<String, Object>> response = new ArrayList<>();
        for (int i = 0; i < rankedList.size(); i++) {
            Map<String, Object> entry = rankedList.get(i);
            entry.put("rank", i + 1);
            response.add(entry);
        }

        return ResponseEntity.ok(response);
    }
}
