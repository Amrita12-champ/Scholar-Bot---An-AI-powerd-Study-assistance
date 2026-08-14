package com.scholarbot.backend.controller;

import com.scholarbot.backend.model.User;
import com.scholarbot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // STEP 1: Check if email exists and verify registration status
    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);

        if (userOpt.isEmpty()) {
            // Email not found at all -> Needs Registration
            return ResponseEntity.ok(Map.of(
                    "exists", false,
                    "requiresRegistration", true
            ));
        }

        User user = userOpt.get();
        if (!user.getIsRegistered()) {
            // Record exists (maybe pre-loaded), but profile registration setup is incomplete
            return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "requiresRegistration", true,
                    "email", email
            ));
        }

        // User exists and is completely registered -> Needs password entry next
        return ResponseEntity.ok(Map.of(
                "exists", true,
                "requiresRegistration", false,
                "email", email
        ));
    }

    // STEP 2: Handle New User Registration
    // Handle New User Registration
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");
        String password = payload.get("password");

        // 1. Check if the user already exists or create a new one
        User user = userRepository.findByEmailIgnoreCase(email).orElse(new User());
        user.setEmail(email);
        user.setName(name);
        user.setPasswordHash(password);
        user.setIsRegistered(true);

        // 🔑 FIX: If this is a brand new user, manually assign a unique String ID
        if (user.getId() == null || user.getId().trim().isEmpty()) {
            user.setId(java.util.UUID.randomUUID().toString()); // Generates a unique string like "123e4567-e89b-12d3..."
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Registration successful!", "user", user));
    }
    // STEP 3: Handle Secure Password Login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        User user = userOpt.get();
        // Match raw or hashed strings safely
        if (!password.equals(user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect password"));
        }

        return ResponseEntity.ok(Map.of("message", "Login successful!", "user", user));
    }
}