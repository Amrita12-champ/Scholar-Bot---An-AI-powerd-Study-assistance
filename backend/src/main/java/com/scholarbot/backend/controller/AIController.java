package com.scholarbot.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scholarbot.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // ✅ Fixed CORS constraints
public class AIController {
    // Keep all internal endpoints (chat, quiz, softskills) exactly the same!

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public AIController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> tutorChat(@RequestBody Map<String, Object> payload) {
        String prompt = (String) payload.get("prompt");
        Object notesContext = payload.get("notesContext");
        Object syllabusContext = payload.get("syllabusContext");

        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required"));
        }

        String notesContextJson = "[]";
        String syllabusContextJson = "[]";
        try {
            if (notesContext != null) {
                notesContextJson = objectMapper.writeValueAsString(notesContext);
            }
            if (syllabusContext != null) {
                syllabusContextJson = objectMapper.writeValueAsString(syllabusContext);
            }
        } catch (Exception e) {
            System.err.println("Context serialization failed: " + e.getMessage());
        }

        String replyText = geminiService.chat(prompt, notesContextJson, syllabusContextJson);
        return ResponseEntity.ok(Map.of("text", replyText));
    }

    @PostMapping("/quiz")
    public ResponseEntity<?> generateQuiz(@RequestBody Map<String, String> payload) {
        String topicName = payload.get("topicName");
        if (topicName == null || topicName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Topic name is required for quiz"));
        }

        String quizJson = geminiService.generateQuiz(topicName);

        // 🧼 FIX: Strip out Markdown formatting block wrappers if present
        if (quizJson != null) {
            quizJson = quizJson.trim();
            if (quizJson.startsWith("```json")) {
                quizJson = quizJson.substring(7);
            } else if (quizJson.startsWith("```")) {
                quizJson = quizJson.substring(3);
            }
            if (quizJson.endsWith("```")) {
                quizJson = quizJson.substring(0, quizJson.length() - 3);
            }
            quizJson = quizJson.trim();
        }

        try {
            // Return parsed JSON structure so frontend receives a structured object cleanly
            Map<?, ?> quizMap = objectMapper.readValue(quizJson, Map.class);
            return ResponseEntity.ok(quizMap);
        } catch (Exception e) {
            System.err.println("Failed to parse quiz response as JSON: " + e.getMessage());
            // Helpful fallback: if parsing fails, print what it received to the terminal logs
            System.err.println("Raw received string was: " + quizJson);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to compile structured JSON, please retry."
            ));
        }
    }

    @PostMapping("/softskills")
    public ResponseEntity<?> softSkills(@RequestBody Map<String, Object> payload) {
        String scenarioId = (String) payload.get("scenarioId");
        List<?> chatHistory = (List<?>) payload.get("chatHistory");
        String userMessage = (String) payload.get("userMessage");

        if (scenarioId == null || userMessage == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "scenarioId and userMessage are required"));
        }

        // Get matching system instructions
        Map<String, String> prompts = new HashMap<>();
        prompts.put("speaking", "You are an expert executive speech coach. Prompt the student to pitch a study concept or present a topic. Provide brief, actionable, high-constructive feedback on their tone, confidence, structure, and clarity. Keep the roleplay active.");
        prompts.put("time", "You are a friendly, laser-focused productivity mentor. Solve the student's procrastination blockages, structure realistic focus habits, and suggest customized breaks. Ask guiding questions to create a 3-step action plan.");
        prompts.put("interview", "You are a professional academic examiner conducting a scholarship/admissions interview. Ask 1 challenging, high-level situational question at a time. Provide precise, constructive feedback on how they can structure their response better using the STAR technique (Situation, Task, Action, Result).");
        prompts.put("resilience", "You are an empathetic, calm, and supportive wellness advisor. Help the student manage academic overwhelm, study anxiety, or disappointing test scores. Provide comforting, mindfulness-oriented grounding advice, breathing tempos, and practical mental models.");

        String systemPrompt = prompts.getOrDefault(scenarioId, "You are a supportive academic coach.");

        String chatHistoryStr = "";
        try {
            if (chatHistory != null) {
                StringBuilder sb = new StringBuilder();
                for (Object o : chatHistory) {
                    sb.append(objectMapper.writeValueAsString(o)).append("\n");
                }
                chatHistoryStr = sb.toString();
            }
        } catch (Exception e) {
            System.err.println("Failed to parse chat history: " + e.getMessage());
        }

        String coachReply = geminiService.generateSoftSkillsResponse(systemPrompt, chatHistoryStr, userMessage);
        return ResponseEntity.ok(Map.of("text", coachReply));
    }
}
