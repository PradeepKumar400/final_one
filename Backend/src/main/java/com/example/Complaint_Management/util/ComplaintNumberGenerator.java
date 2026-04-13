package com.example.Complaint_Management.util;

import com.example.Complaint_Management.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

@Component
@RequiredArgsConstructor
public class ComplaintNumberGenerator {

    private final ComplaintRepository complaintRepository;
    private final AtomicLong counter = new AtomicLong(0);

    /**
     * Generates unique complaint numbers like: CMP-2024-00042
     */
    public synchronized String generate() {
        int year = LocalDate.now().getYear();
        long count = complaintRepository.count() + 1 + counter.getAndIncrement();
        return String.format("CMP-%d-%05d", year, count);
    }
}
