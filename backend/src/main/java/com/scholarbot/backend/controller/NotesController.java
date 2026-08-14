package com.scholarbot.backend.controller;
import com.scholarbot.backend.model.Note;
import com.scholarbot.backend.repository.NoteRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;
import com.scholarbot.backend.model.Note;
import com.scholarbot.backend.service.NotesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // Fixed CORS constraint mapping
public class NotesController {
    // Keep all internal endpoint methods exactly the same!


    private final NotesService notesService;

    @Autowired
    public NotesController(NotesService notesService) {
        this.notesService = notesService;
    }

    @GetMapping("/notes/{userId}")
    public ResponseEntity<List<Note>> getNotes(@PathVariable String userId) {
        List<Note> notes = notesService.getNotesForUser(userId);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/notes")
    public ResponseEntity<Note> createNote(@RequestBody Note note) {
        Note created = notesService.createNote(
                note.getUserId(),
                note.getTitle(),
                note.getContent(),
                note.getCategory()
        );
        return ResponseEntity.ok(created);
    }

    @PutMapping("/notes/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable String id, @RequestBody Note note) {
        return notesService.updateNote(id, note)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable String id) {
        notesService.deleteNote(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/notes/{id}/ai-summarize")
    public ResponseEntity<?> aiSummarize(@PathVariable String id) {
        return notesService.aiSummarizeAndGenerateFlashcards(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // 🚀 ADD THIS METHOD INSIDE YOUR NOTESCONTROLLER CLASS
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getNotesByUser(@PathVariable("userId") String userId) {
        // Fetch notes matching the logged-in student's ID
        java.util.List<Note> userNotes = noteRepository.findByUserId(userId);
        return ResponseEntity.ok(userNotes);
    }
    @Autowired
    private NoteRepository noteRepository;
    @CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
    @PostMapping("/upload-pdf")
    public ResponseEntity<?> uploadPdfNote(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty."));
        }

        try {
            // 1. Load the PDF file from the multipart request stream
            byte[] bytes = file.getBytes();
            String extractedText = "";

            try (PDDocument document = Loader.loadPDF(bytes)) {
                PDFTextStripper pdfStripper = new PDFTextStripper();
                extractedText = pdfStripper.getText(document);
            }

            if (extractedText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Could not extract any readable text from this PDF."));
            }

            // 2. Create a new Note object entity
            Note note = new Note();

            // Clean up file name extensions for the title layout
            String originalName = file.getOriginalFilename();
            String title = (originalName != null && originalName.contains("."))
                    ? originalName.substring(0, originalName.lastIndexOf('.'))
                    : "Uploaded PDF Note";

            note.setTitle(title);
            note.setContent(extractedText.trim());
            note.setUserId(userId);

            // If your Note entity requires a unique string ID generation strategy like User:
            note.setId(java.util.UUID.randomUUID().toString());

            // 3. Save to database
            Note savedNote = noteRepository.save(note);

            return ResponseEntity.ok(Map.of(
                    "message", "PDF uploaded and parsed successfully!",
                    "note", savedNote
            ));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process PDF file: " + e.getMessage()));
        }
    }

}
