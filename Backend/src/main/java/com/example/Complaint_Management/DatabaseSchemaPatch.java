package com.example.Complaint_Management;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaPatch implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info(">>>> [SYSTEM FIX] Checking for PRESIDENT role support in MySQL...");
            
            // This command adds 'PRESIDENT' to the ENUM list in MySQL
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'WARD_MEMBER', 'CITIZEN', 'PRESIDENT') NOT NULL");
            
            log.info(">>>> [SYSTEM FIX] SUCCESS: PRESIDENT role is now supported in your database.");
        } catch (Exception e) {
            log.warn(">>>> [SYSTEM FIX] Already updated or manual fix required: {}", e.getMessage());
        }
    }
}
