package com.example.Complaint_Management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ComplaintManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ComplaintManagementApplication.class, args);
    }
}
