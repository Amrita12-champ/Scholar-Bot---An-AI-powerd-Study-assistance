package com.scholarbot.backend.service;

import com.scholarbot.backend.model.Exam;
import com.scholarbot.backend.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExamService {

    private final ExamRepository examRepository;

    @Autowired
    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public List<Exam> getExamsForUser(String userId) {
        return examRepository.findByUserIdOrUserId(userId, "any");
    }

    public Exam createExam(String userId, String title, LocalDateTime date, String subject, int preparationLevel) {
        String id = "exam-" + UUID.randomUUID().toString().substring(0, 8);
        Exam exam = new Exam(id, userId, title, date, subject, preparationLevel);

        // Preseed simple exam tasks
        String tasksJson = "[\n" +
                "  {\"id\":\"t-" + UUID.randomUUID().toString().substring(0, 3) + "\",\"text\":\"Review chapter key milestones\",\"done\":false},\n" +
                "  {\"id\":\"t-" + UUID.randomUUID().toString().substring(0, 3) + "\",\"text\":\"Take dynamic practice quiz\",\"done\":false}\n" +
                "]";
        exam.setTasksJson(tasksJson);

        return examRepository.save(exam);
    }

    public Optional<Exam> updateExam(String id, Exam updatedData) {
        return examRepository.findById(id).map(exam -> {
            if (updatedData.getTitle() != null) exam.setTitle(updatedData.getTitle());
            if (updatedData.getDate() != null) exam.setDate(updatedData.getDate());
            if (updatedData.getSubject() != null) exam.setSubject(updatedData.getSubject());
            if (updatedData.getPreparationLevel() != 0) exam.setPreparationLevel(updatedData.getPreparationLevel());
            if (updatedData.getTasksJson() != null) exam.setTasksJson(updatedData.getTasksJson());
            return examRepository.save(exam);
        });
    }

    public void deleteExam(String id) {
        examRepository.deleteById(id);
    }
}
