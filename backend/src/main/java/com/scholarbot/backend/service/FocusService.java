package com.scholarbot.backend.service;

import com.scholarbot.backend.model.FocusSession;
import com.scholarbot.backend.model.User;
import com.scholarbot.backend.repository.FocusSessionRepository;
import com.scholarbot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FocusService {

    private final FocusSessionRepository focusSessionRepository;
    private final UserRepository userRepository;

    @Autowired
    public FocusService(FocusSessionRepository focusSessionRepository, UserRepository userRepository) {
        this.focusSessionRepository = focusSessionRepository;
        this.userRepository = userRepository;
    }

    public List<FocusSession> getSessionsForUser(String userId) {
        return focusSessionRepository.findByUserIdOrUserId(userId, "any");
    }

    public FocusSession createSession(String userId, int duration, String category, String notes, boolean completed) {
        String id = "sess-" + UUID.randomUUID().toString().substring(0, 8);
        FocusSession session = new FocusSession(id, userId, duration, category, notes, completed);
        session.setTimestamp(LocalDateTime.now());
        focusSessionRepository.save(session);

        // Update user metrics
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            int addedXp = (int) Math.floor(duration * 1.5);
            int addedPoints = duration;

            user.setXp(user.getXp() + addedXp);
            user.setStudyPoints(user.getStudyPoints() + addedPoints);
            // 1000 XP per level
            user.setLevel((user.getXp() / 1000) + 1);
            user.setLastStudyDate(LocalDate.now());

            userRepository.save(user);
        }

        return session;
    }
}
