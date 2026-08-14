package com.scholarbot.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ScholarBotApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScholarBotApplication.class, args);
        System.out.println("====================================================================");
        System.out.println("  ScholarBot Low-Coupled Spring Boot Backend Started Successfully! ");
        System.out.println("  API Server is running on: http://localhost:8080                    ");
        System.out.println("  H2 DB Console is enabled on: http://localhost:8080/h2-console      ");
        System.out.println("====================================================================");
    }
}
