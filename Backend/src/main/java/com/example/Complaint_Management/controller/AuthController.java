package com.example.Complaint_Management.controller;

import com.example.Complaint_Management.dto.Request.LoginRequest;
import com.example.Complaint_Management.dto.Request.RegisterRequest;
import com.example.Complaint_Management.dto.Response.ApiResponse;
import com.example.Complaint_Management.dto.Response.AuthResponse;
import com.example.Complaint_Management.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints.
 *
 * POST /api/v1/auth/login          — open (no token needed)
 * POST /api/v1/auth/register       — ADMIN only (admin creates ward member accounts)
 * POST /api/v1/auth/register/admin — open (for seeding the very first admin; disable in prod)
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Login — returns JWT token + user profile.
     * Callable by anyone (ward member or admin).
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    /**
     * Register a new account.
     * Citizens can register themselves (anonymous access).
     * Administrators can register staff (WARD_MEMBER) or other Admins.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // SECURITY: If not an admin, force the role to CITIZEN to prevent privilege escalation.
        if (!isAdmin) {
            request.setRole(com.example.Complaint_Management.enums.Role.CITIZEN);
            request.setWardId(null);
            request.setWardName(null);
        }

        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    /**
     * Bootstrap endpoint — creates the very first ADMIN account.
     * Remove or secure this in production after initial setup.
     */
    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse<AuthResponse>> registerFirstAdmin(
            @Valid @RequestBody RegisterRequest request) {
        // Force role to ADMIN regardless of what was sent
        request.setRole(com.example.Complaint_Management.enums.Role.ADMIN);
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin account created", response));
    }
}
