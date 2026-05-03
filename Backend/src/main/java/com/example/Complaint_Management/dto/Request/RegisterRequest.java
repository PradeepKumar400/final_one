package com.example.Complaint_Management.dto.Request;

import com.example.Complaint_Management.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /api/v1/auth/register
 * Admin creates ward members (or another admin seeds the first admin).
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    private String username;          // unique login identifier (e.g. phone or email)

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;

    @NotNull(message = "Role is required")
    private Role role;                // ADMIN or WARD_MEMBER

    // Required when role = WARD_MEMBER
    private String wardId;
    private String wardName;

    // Module 1: Blockchain Wallet fields
    private String walletId;
    private String publicKey;
}
