package com.scholarbot.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class GeminiServiceImpl implements GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String chat(String prompt, String notesContextJson, String syllabusContextJson) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return getMockTutorResponse(prompt);
        }

        try {
            String systemInstruction = "You are ScholarBot, an exceptionally motivating, highly structured personal AI Study Tutor.\n" +
                    "Your purpose is to answer students' academic queries step-by-step with high-quality explanations, examples, and motivational insights.\n";

            if (notesContextJson != null && !notesContextJson.equals("[]")) {
                systemInstruction += "\nRelevant user study notes context:\n" + notesContextJson + "\n";
            }
            if (syllabusContextJson != null && !syllabusContextJson.equals("[]")) {
                systemInstruction += "\nRelevant syllabus tracker context:\n" + syllabusContextJson + "\n";
            }

            return invokeGeminiAPI(prompt, systemInstruction, "null");
        } catch (Exception e) {
            System.err.println("Gemini Chat request failed: " + e.getMessage());
            return "I apologize, but I ran into a communication issue with Gemini: " + e.getMessage() + ". Here is a temporary answer: Focus on small incremental steps to master the concept!";
        }
    }

    @Override
    public String generateQuiz(String topicName) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return getMockQuizResponse(topicName);
        }

        try {
            String prompt = "Create a challenging 3-question multiple-choice practice quiz for the student on the educational topic: \"" + topicName + "\".\n" +
                    "Generate precise options with strictly 1 correct answer. Provide immediate interactive grading details including a comprehensive explanation of why the correct option is right.\n" +
                    "Return it inside the exact structure requested.";

            // 🛠️ Build standard JSON mapping schema parameters directly as a map definition descriptor object
            Map<String, Object> schema = new HashMap<>();
            schema.put("type", "OBJECT");

            Map<String, Object> properties = new HashMap<>();
            properties.put("topic", Map.of("type", "STRING"));

            Map<String, Object> questionItems = new HashMap<>();
            questionItems.put("type", "OBJECT");
            questionItems.put("properties", Map.of(
                    "question", Map.of("type", "STRING"),
                    "options", Map.of("type", "ARRAY", "items", Map.of("type", "STRING")),
                    "correctIndex", Map.of("type", "INTEGER"),
                    "explanation", Map.of("type", "STRING")
            ));
            questionItems.put("required", List.of("question", "options", "correctIndex", "explanation"));

            properties.put("questions", Map.of("type", "ARRAY", "items", questionItems));
            schema.put("properties", properties);
            schema.put("required", List.of("topic", "questions"));

            return invokeGeminiAPI(prompt, "You are a professional educational assessment compiler.", schema);
        } catch (Exception e) {
            System.err.println("Gemini Quiz request failed: " + e.getMessage());
            return getMockQuizResponse(topicName);
        }
    }

    @Override
    public String generateSoftSkillsResponse(String systemPrompt, String chatHistoryString, String userMessage) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "Hello! I am your AI coach. (This is a helpful sandbox response). Keep going, tell me more about your experience and how you can apply the STAR method!";
        }

        try {
            String prompt = chatHistoryString + "\nStudent (new input): " + userMessage + "\nCoach:";
            return invokeGeminiAPI(prompt, systemPrompt, "null");
        } catch (Exception e) {
            System.err.println("Gemini Soft Skills request failed: " + e.getMessage());
            return "I apologize, but I failed to fetch my coaching parameters from Gemini. Practice is key, let's keep refining our structure!";
        }
    }

    @Override
    public String summarizeNoteAndGenerateFlashcards(String title, String content) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "{\n" +
                    "  \"summary\": \"### Quick Note Summary\\n\\nThis is a placeholder summary for **" + title + "**. Set your `GEMINI_API_KEY` to trigger automated professional summarizations and key bullet-point extractions.\\n\\n* **Bullet 1**: Review the core definitions.\\n* **Bullet 2**: Practice key derivations.\",\n" +
                    "  \"flashcards\": [\n" +
                    "    { \"front\": \"What is the primary topic of " + title + "?\", \"back\": \"Refer to your revision notes inside the panel.\" },\n" +
                    "    { \"front\": \"How do we ensure optimal retention?\", \"back\": \"Explain in your own words using active recall.\" }\n" +
                    "  ]\n" +
                    "}";
        }

        try {
            String prompt = "You are ScholarBot, an elite academic summarizer. Summarize the following study note content beautifully.\n" +
                    "Focus strictly on explaining complex educational details clearly, extracting the core bullet points, and creating exactly 2 to 3 useful study flashcards for this note.\n\n" +
                    "Note Title: " + title + "\n" +
                    "Note Content:\n" + content;

            String jsonSchema = "{\n" +
                    "  \"type\": \"object\",\n" +
                    "  \"properties\": {\n" +
                    "    \"summary\": { \"type\": \"string\" },\n" +
                    "    \"flashcards\": {\n" +
                    "      \"type\": \"array\",\n" +
                    "      \"items\": {\n" +
                    "        \"type\": \"object\",\n" +
                    "        \"properties\": {\n" +
                    "          \"front\": { \"type\": \"string\" },\n" +
                    "          \"back\": { \"type\": \"string\" }\n" +
                    "        },\n" +
                    "        \"required\": [\"front\", \"back\"]\n" +
                    "      }\n" +
                    "    }\n" +
                    "  },\n" +
                    "  \"required\": [\"summary\", \"flashcards\"]\n" +
                    "}";

            return invokeGeminiAPI(prompt, "You are ScholarBot, an elite academic summarizer.", jsonSchema);
        } catch (Exception e) {
            System.err.println("Gemini Note Summarization failed: " + e.getMessage());
            return "{\"summary\":\"Failed to call Gemini API.\",\"flashcards\":[]}";
        }
    }

    // Direct REST API invoker
    // 1️⃣ OVERLOAD 1: Keep this original string version for chat, notes, and soft skills!
    private String invokeGeminiAPI(String prompt, String systemInstruction, String jsonSchema) throws Exception {
        Map<String, Object> generationConfig = new HashMap<>();
        if (jsonSchema != null) {
            generationConfig.put("responseMimeType", "application/json");
        }
        return invokeGeminiAPICore(prompt, systemInstruction, generationConfig);
    }

    // 2️⃣ OVERLOAD 2: Use this version for your structured quiz generation schema map!
    private String invokeGeminiAPI(String prompt, String systemInstruction, Map<String, Object> responseSchemaMap) throws Exception {
        Map<String, Object> generationConfig = new HashMap<>();
        if (responseSchemaMap != null) {
            generationConfig.put("responseMimeType", "application/json");
            generationConfig.put("responseSchema", responseSchemaMap);
        }
        return invokeGeminiAPICore(prompt, systemInstruction, generationConfig);
    }

    // 3️⃣ THE CORE CALL: Handles the actual HTTP request smoothly for both versions
    private String invokeGeminiAPICore(String prompt, String systemInstruction, Map<String, Object> generationConfig) throws Exception {
        if (this.apiKey != null) {
            System.out.println("DEBUG: Current API Key length = " + this.apiKey.length());
            System.out.println("DEBUG: Starts with = " + (this.apiKey.startsWith("AIzaSy") ? "YES (Valid Prefix)" : "NO (Broken)"));
            System.out.println("DEBUG: Raw Value inside Spring Boot = [" + this.apiKey + "]");
        } else {
            System.out.println("DEBUG: API Key is completely NULL");
        }
        String cleanApiKey = this.apiKey != null ? this.apiKey.trim() : "";
        String baseApiUrl = (this.apiUrl != null && !this.apiUrl.trim().isEmpty())
                ? this.apiUrl.trim()
                : "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        String urlWithKey = baseApiUrl + "?key=" + cleanApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();

        // Contents
        List<Map<String, Object>> contentsList = new ArrayList<>();
        Map<String, Object> contentsMap = new HashMap<>();
        List<Map<String, Object>> partsList = new ArrayList<>();
        Map<String, Object> textMap = new HashMap<>();
        textMap.put("text", prompt);
        partsList.add(textMap);
        contentsMap.put("parts", partsList);
        contentsList.add(contentsMap);
        requestBody.put("contents", contentsList);

        // System Instruction
        if (systemInstruction != null && !systemInstruction.isEmpty()) {
            Map<String, Object> sysInstrMap = new HashMap<>();
            List<Map<String, Object>> sysPartsList = new ArrayList<>();
            Map<String, Object> sysTextMap = new HashMap<>();
            sysTextMap.put("text", systemInstruction);
            sysPartsList.add(sysTextMap);
            sysInstrMap.put("parts", sysPartsList);
            requestBody.put("systemInstruction", sysInstrMap);
        }

        // Inject the dynamically built config block
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map body = response.getBody();
            List candidates = (List) body.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map candidate = (Map) candidates.get(0);
                Map content = (Map) candidate.get("content");
                if (content != null) {
                    List parts = (List) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map part = (Map) parts.get(0);
                        return (String) part.get("text");
                    }
                }
            }
        }

        throw new RuntimeException("Unexpected response format from Gemini API");
    }

    // Sandbox fallbacks to provide an excellent offline experience
    private String getMockTutorResponse(String prompt) {
        return "👋 **Hello! I am ScholarBot (Sandbox Mode)**.\n\n" +
                "To unlock live, real-time responses from my AI tutor engine, please configure your **`GEMINI_API_KEY`** in the Secrets panel.\n\n" +
                "In the meantime, here is an elite academic guide on your inquiry: *\"" + prompt + "\"*\n\n" +
                "1. **Core Concept**: Break complex topics down into atomic, distinct bullet points.\n" +
                "2. **Active Recall**: Test your comprehension after 25 minutes of focus rather than re-reading notes.\n" +
                "3. **Feynman Technique**: Try explaining this concept to a peer in the *Global Library* chat space!";
    }

    private String getMockQuizResponse(String topicName) {
        return "{\n" +
                "  \"topic\": \"" + topicName + " (Sandbox Mode)\",\n" +
                "  \"questions\": [\n" +
                "    {\n" +
                "      \"question\": \"Which technique is best for memorization and concept crystallization?\",\n" +
                "      \"options\": [\n" +
                "        \"Re-reading the textbook chapter 5 times\",\n" +
                "        \"Active recall and spaced-repetition flashcards\",\n" +
                "        \"Highlighting 90% of the page text\",\n" +
                "        \"Cramming 10 hours straight before the test\"\n" +
                "      ],\n" +
                "      \"correctIndex\": 1,\n" +
                "      \"explanation\": \"Active recall combined with spaced repetition challenges the brain to reconstruct pathways, strengthening neural connections much faster than passive re-reading.\"\n" +
                "    },\n" +
                "    {\n" +
                "      \"question\": \"Under the Pomodoro Technique, what is the recommended study-to-break ratio?\",\n" +
                "      \"options\": [\n" +
                "        \"60 mins study, 1 min break\",\n" +
                "        \"10 mins study, 30 mins break\",\n" +
                "        \"25 mins study, 5 mins break\",\n" +
                "        \"4 hours study, no break\"\n" +
                "      ],\n" +
                "      \"correctIndex\": 2,\n" +
                "      \"explanation\": \"25 minutes of high-focus study followed by a 5-minute cognitive rest is the standard Pomodoro block to maximize focus and avoid mental fatigue.\"\n" +
                "    },\n" +
                "    {\n" +
                "      \"question\": \"What does 'low-coupling' in software system architecture promote?\",\n" +
                "      \"options\": [\n" +
                "        \"Tightly bound interfaces that crash when any file is modified\",\n" +
                "        \"Combining all classes into one single large file\",\n" +
                "        \"Increased independence between modules for high reusability and isolated testing\",\n" +
                "        \"Slower compilation speeds\"\n" +
                "      ],\n" +
                "      \"correctIndex\": 2,\n" +
                "      \"explanation\": \"Low-coupling decreases direct dependencies between classes or packages, making it easy to replace, upgrade, or test components in isolation without causing cascade failures!\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";
    }
}
