package com.scholarbot.backend.controller;

import com.scholarbot.backend.model.Exam;
import com.scholarbot.backend.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ExamController {

    private final ExamService examService;

    @Autowired
    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping("/exams/{userId}")
    public ResponseEntity<List<Exam>> getExams(@PathVariable String userId) {
        List<Exam> exams = examService.getExamsForUser(userId);
        return ResponseEntity.ok(exams);
    }

    @PostMapping("/exams")
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        Exam created = examService.createExam(
                exam.getUserId(),
                exam.getTitle(),
                exam.getDate(),
                exam.getSubject(),
                exam.getPreparationLevel()
        );
        return ResponseEntity.ok(created);
    }

    @PutMapping("/exams/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable String id, @RequestBody Exam exam) {
        return examService.updateExam(id, exam)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable String id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
