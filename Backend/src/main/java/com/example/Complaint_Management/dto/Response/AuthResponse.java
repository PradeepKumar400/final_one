package com.example.Complaint_Management.dto.Response;

import com.example.Complaint_Management.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Returned after successful login or registration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private UUID userId;
    private String username;
    private String fullName;
    private Role role;
    private String wardId;    // null for ADMIN
    private String wardName;  // null for ADMIN
}
