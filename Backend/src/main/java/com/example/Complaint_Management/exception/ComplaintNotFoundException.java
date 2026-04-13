package com.example.Complaint_Management.exception;

public class ComplaintNotFoundException extends RuntimeException {
    public ComplaintNotFoundException(String message) {
        super(message);
    }
}
