package com.scholarbot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scholarbot.backend.model.Note;
import com.scholarbot.backend.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotesService {

    private final NoteRepository noteRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public NotesService(NoteRepository noteRepository, GeminiService geminiService) {
        this.noteRepository = noteRepository;
        this.geminiService = geminiService;
    }

    public List<Note> getNotesForUser(String userId) {
        return noteRepository.findByUserIdOrUserId(userId, "any");
    }

    public Note createNote(String userId, String title, String content, String category) {
        String id = "note-" + UUID.randomUUID().toString().substring(0, 8);
        Note note = new Note(id, userId, title, content, category);
        return noteRepository.save(note);
    }

    public Optional<Note> updateNote(String id, Note updatedData) {
        return noteRepository.findById(id).map(note -> {
            if (updatedData.getTitle() != null) note.setTitle(updatedData.getTitle());
            if (updatedData.getContent() != null) note.setContent(updatedData.getContent());
            if (updatedData.getCategory() != null) note.setCategory(updatedData.getCategory());
            if (updatedData.getSummary() != null) note.setSummary(updatedData.getSummary());
            if (updatedData.getFlashcardsJson() != null) note.setFlashcardsJson(updatedData.getFlashcardsJson());
            return noteRepository.save(note);
        });
    }

    public void deleteNote(String id) {
        noteRepository.deleteById(id);
    }

    public Optional<Note> aiSummarizeAndGenerateFlashcards(String id) {
        Optional<Note> noteOpt = noteRepository.findById(id);
        if (noteOpt.isEmpty()) {
            return Optional.empty();
        }

        Note note = noteOpt.get();
        String resultJson = geminiService.summarizeNoteAndGenerateFlashcards(note.getTitle(), note.getContent());

        try {
            // Validate and extract JSON
            JsonNode root = objectMapper.readTree(resultJson);
            String summary = root.path("summary").asText();
            JsonNode flashcardsNode = root.path("flashcards");

            note.setSummary(summary);
            note.setFlashcardsJson(objectMapper.writeValueAsString(flashcardsNode));
            return Optional.of(noteRepository.save(note));
        } catch (Exception e) {
            System.err.println("Failed to map AI note summary results: " + e.getMessage());
            // Fallback manual mapping if JSON is slightly irregular
            note.setSummary("### Summary\n\n" + note.getContent().substring(0, Math.min(note.getContent().length(), 200)) + "...");
            note.setFlashcardsJson("[]");
            return Optional.of(noteRepository.save(note));
        }
    }
}
