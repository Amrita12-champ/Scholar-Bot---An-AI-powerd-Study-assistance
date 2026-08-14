package com.scholarbot.backend.service;

public interface GeminiService {

    /**
     * Contextual tutoring chat with ScholarBot.
     */
    String chat(String prompt, String notesContextJson, String syllabusContextJson);

    /**
     * Composes a challenging 3-question MCQ quiz for a given topic.
     */
    String generateQuiz(String topicName);

    /**
     * Conducts soft skills feedback for specific interview/speaking roleplay.
     */
    String generateSoftSkillsResponse(String systemPrompt, String chatHistoryString, String userMessage);

    /**
     * Summarizes educational notes and crafts study flashcards.
     */
    String summarizeNoteAndGenerateFlashcards(String title, String content);
}
