package com.scholarbot.backend.config;

import com.scholarbot.backend.model.*;
import com.scholarbot.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FocusSessionRepository focusSessionRepository;
    private final SyllabusRepository syllabusRepository;
    private final NoteRepository noteRepository;
    private final ExamRepository examRepository;
    private final RoomRepository roomRepository;

    @Autowired
    public DatabaseSeeder(UserRepository userRepository,
                          FocusSessionRepository focusSessionRepository,
                          SyllabusRepository syllabusRepository,
                          NoteRepository noteRepository,
                          ExamRepository examRepository,
                          RoomRepository roomRepository) {
        this.userRepository = userRepository;
        this.focusSessionRepository = focusSessionRepository;
        this.syllabusRepository = syllabusRepository;
        this.noteRepository = noteRepository;
        this.examRepository = examRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking ScholarBot database states...");

        // 1. Seed Global Study Rooms (Crucial for the Frontend Interface)
        if (roomRepository.count() == 0) {
            System.out.println("Seeding global study rooms...");
            Room room1 = new Room("global-library", "📚 Global Library", "Quiet focus room for deep study. Pomodoro fans welcome!",
                    "[\n" +
                            "  {\"userId\":\"mock-1\",\"userName\":\"Anya (Math Wizard)\",\"avatar\":\"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150\",\"xp\":1240,\"currentActivity\":\"Focusing (Mathematics)\"},\n" +
                            "  {\"userId\":\"mock-2\",\"userName\":\"Liam Code\",\"avatar\":\"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150\",\"xp\":950,\"currentActivity\":\"Focusing (Computer Science)\"},\n" +
                            "  {\"userId\":\"mock-3\",\"userName\":\"Zara\",\"avatar\":\"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150\",\"xp\":1810,\"currentActivity\":\"Chilling\"}\n" +
                            "]",
                    "[\n" +
                            "  {\"id\":\"msg-1\",\"userName\":\"Anya (Math Wizard)\",\"text\":\"Just completed a 50min calculus streak!\",\"timestamp\":\"" + LocalDateTime.now().minusHours(1) + "\"},\n" +
                            "  {\"id\":\"msg-2\",\"userName\":\"Liam Code\",\"text\":\"Nice work! I'm jumping in for a 25min coding block now.\",\"timestamp\":\"" + LocalDateTime.now().minusMinutes(30) + "\"}\n" +
                            "]"
            );

            Room room2 = new Room("ai-lab", "🤖 AI & Tech Lab", "Collaborative query solving and exam prep with peers.",
                    "[\n" +
                            "  {\"userId\":\"mock-4\",\"userName\":\"Dr. Dave\",\"avatar\":\"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150\",\"xp\":2150,\"currentActivity\":\"Query Solving\"},\n" +
                            "  {\"userId\":\"mock-5\",\"userName\":\"Emma Study\",\"avatar\":\"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150\",\"xp\":820,\"currentActivity\":\"Focusing (Other)\"}\n" +
                            "]",
                    "[\n" +
                            "  {\"id\":\"msg-3\",\"userName\":\"Emma Study\",\"text\":\"Has anyone tried the weekly AI-generated test? It's amazing for physics.\",\"timestamp\":\"" + LocalDateTime.now().minusHours(2) + "\"},\n" +
                            "  {\"id\":\"msg-4\",\"userName\":\"Dr. Dave\",\"text\":\"Yes! The grading feedback really solidifies weak concepts.\",\"timestamp\":\"" + LocalDateTime.now().minusHours(1) + "\"}\n" +
                            "]"
            );

            Room room3 = new Room("softskills-lounge", "💬 Soft Skills Lounge", "Develop your presentation, interview, and leadership skills here.",
                    "[\n" +
                            "  {\"userId\":\"mock-6\",\"userName\":\"Olivia Voice\",\"avatar\":\"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150\",\"xp\":1100,\"currentActivity\":\"Soft Skill Play\"}\n" +
                            "]",
                    "[\n" +
                            "  {\"id\":\"msg-5\",\"userName\":\"Olivia Voice\",\"text\":\"Doing the AI Public Speaking Coach session. Highly recommend!\",\"timestamp\":\"" + LocalDateTime.now().minusMinutes(10) + "\"}\n" +
                            "]"
            );

            roomRepository.save(room1);
            roomRepository.save(room2);
            roomRepository.save(room3);
        }

        // 2. Seed Sandbox Sandbox User Profiles
        if (userRepository.count() == 0) {
            System.out.println("Preloading sandbox student profiles...");
            User anya = new User("mock-1", "Anya (Math Wizard)", "anya@scholarbot.com",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150");
            anya.setLevel(5);
            anya.setXp(1240);
            anya.setStudyPoints(450);
            anya.setStreak(6);
            anya.setTargetHours(6);
            anya.setLastStudyDate(LocalDate.now());
            anya.setCategoryTargetsJson("{\"Mathematics\":120,\"Physics\":90,\"Computer Science\":90,\"Language\":60,\"Other\":60}");

            User liam = new User("mock-2", "Liam Code", "liam@scholarbot.com",
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");
            liam.setLevel(4);
            liam.setXp(950);
            liam.setStudyPoints(320);
            liam.setStreak(3);
            liam.setTargetHours(5);
            liam.setLastStudyDate(LocalDate.now());
            liam.setCategoryTargetsJson("{\"Mathematics\":60,\"Physics\":60,\"Computer Science\":180,\"Language\":45,\"Other\":45}");

            User zara = new User("mock-3", "Zara", "zara@scholarbot.com",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150");
            zara.setLevel(7);
            zara.setXp(1810);
            zara.setStudyPoints(620);
            zara.setStreak(12);
            zara.setTargetHours(8);
            zara.setLastStudyDate(LocalDate.now());
            zara.setCategoryTargetsJson("{\"Mathematics\":120,\"Physics\":120,\"Computer Science\":120,\"Language\":120,\"Other\":120}");

            userRepository.save(anya);
            userRepository.save(liam);
            userRepository.save(zara);
        }

        // 3. Seed Focus Sessions
        if (focusSessionRepository.count() == 0) {
            FocusSession sess1 = new FocusSession("sess-1", "mock-1", 50, "Mathematics", "Worked on calculus integrals", true);
            FocusSession sess2 = new FocusSession("sess-2", "mock-2", 25, "Computer Science", "Express backend routing practice", true);
            FocusSession sess3 = new FocusSession("sess-3", "mock-3", 45, "Physics", "Quantum mechanics basic axioms review", true);

            focusSessionRepository.save(sess1);
            focusSessionRepository.save(sess2);
            focusSessionRepository.save(sess3);
        }

        // 4. Seed Syllabus Items
        if (syllabusRepository.count() == 0) {
            SyllabusItem item1 = new SyllabusItem("topic-1", "any", "Mathematics", "Chapter 3: Calculus", "Integration by Parts", "mastered");
            SyllabusItem item2 = new SyllabusItem("topic-2", "any", "Computer Science", "Chapter 1: Network Protocols", "TCP/IP vs UDP handshake mechanics", "in_progress");
            SyllabusItem item3 = new SyllabusItem("topic-3", "any", "Physics", "Chapter 5: Thermodynamics", "Entropy & Second Law", "pending");

            syllabusRepository.save(item1);
            syllabusRepository.save(item2);
            syllabusRepository.save(item3);
        }

        // 5. Seed Notes
        if (noteRepository.count() == 0) {
            Note note1 = new Note("note-1", "any", "Mechanisms of DNS",
                    "The Domain Name System (DNS) translates human-readable domain names into IP addresses. It starts at the resolver, queries the Root Server, the TLD (Top-Level Domain) server, and finally the Authoritative Name Server to fetch the correct IP address. DNS typically operates on UDP port 53.",
                    "Computer Science");
            note1.setSummary("DNS translates domain names to IP addresses starting from the root nameservers down to authoritative nameservers, running on UDP Port 53.");
            note1.setFlashcardsJson("[\n" +
                    "  {\"front\":\"What port does DNS primarily use?\",\"back\":\"UDP Port 53\"},\n" +
                    "  {\"front\":\"What is the start of a DNS query chain?\",\"back\":\"DNS Resolver\"}\n" +
                    "]");
            noteRepository.save(note1);
        }

        // 6. Seed Exams
        if (examRepository.count() == 0) {
            Exam exam1 = new Exam("exam-1", "any", "Midterm Calculus Exam", LocalDateTime.now().plusDays(5), "Mathematics", 65);
            exam1.setTasksJson("[\n" +
                    "  {\"id\":\"t-1\",\"text\":\"Solve 20 mock integration problems\",\"done\":true},\n" +
                    "  {\"id\":\"t-2\",\"text\":\"Revise Taylor Series expansion proof\",\"done\":false},\n" +
                    "  {\"id\":\"t-3\",\"text\":\"Take weekly AI calculus quiz\",\"done\":false}\n" +
                    "]");
            examRepository.save(exam1);
        }

        System.out.println("ScholarBot database validation finalized successfully!");
    }
}