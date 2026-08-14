package com.scholarbot.backend.controller;

import com.scholarbot.backend.model.SyllabusItem;
import com.scholarbot.backend.service.SyllabusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // Fixed CORS constraint mapping
public class SyllabusController {
    // Keep all internal endpoints exactly the same!


    private final SyllabusService syllabusService;

    @Autowired
    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    @GetMapping("/syllabus/{userId}")
    public ResponseEntity<List<SyllabusItem>> getSyllabus(@PathVariable String userId) {
        List<SyllabusItem> items = syllabusService.getSyllabusForUser(userId);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/syllabus")
    public ResponseEntity<SyllabusItem> createItem(@RequestBody SyllabusItem item) {
        SyllabusItem created = syllabusService.createItem(
                item.getUserId(),
                item.getSubject(),
                item.getChapter(),
                item.getTopic(),
                item.getStatus()
        );
        return ResponseEntity.ok(created);
    }

    @PutMapping("/syllabus/{id}")
    public ResponseEntity<SyllabusItem> updateItem(@PathVariable String id, @RequestBody SyllabusItem item) {
        return syllabusService.updateItem(id, item)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/syllabus/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable String id) {
        syllabusService.deleteItem(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
