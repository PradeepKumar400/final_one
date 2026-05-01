package com.example.Complaint_Management.entity;

import com.example.Complaint_Management.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * System user — can be ADMIN, WARD_MEMBER, or CITIZEN.
 * Stores hashed password and ward assignment (for WARD_MEMBER).
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;          // phone number or email used to log in

    @Column(nullable = false)
    private String password;          // BCrypt-hashed

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /**
     * Applicable only for WARD_MEMBER — restricts which ward they can see.
     * NULL for ADMIN (can see all wards).
     */
    @Column(name = "ward_id")
    private String wardId;

    @Column(name = "ward_name")
    private String wardName;

    // --- Module 1: Blockchain Wallet & Identity ---
    @Column(name = "wallet_id", unique = true)
    private String walletId;

    @Column(name = "public_key", length = 1024)
    private String publicKey; // Encoded public key for signature verification

    @Column(name = "wallet_active")
    @Builder.Default
    private Boolean walletActive = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
