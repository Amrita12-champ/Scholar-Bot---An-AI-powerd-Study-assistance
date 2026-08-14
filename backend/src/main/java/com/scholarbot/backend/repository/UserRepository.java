package com.scholarbot.backend.repository;

import com.scholarbot.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // Add or update this exact line to match your UserService query:
    Optional<User> findByEmailIgnoreCase(String email);
}