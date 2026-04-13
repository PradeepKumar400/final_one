package com.example.Complaint_Management.service;

import com.example.Complaint_Management.dto.Request.LoginRequest;
import com.example.Complaint_Management.dto.Request.RegisterRequest;
import com.example.Complaint_Management.dto.Response.AuthResponse;

public interface AuthService {

    /**
     * Register a new ADMIN or WARD_MEMBER account.
     * Only callable by ADMIN (enforced at controller level).
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticate username + password → JWT.
     */
    AuthResponse login(LoginRequest request);
}
