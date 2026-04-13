package com.example.Complaint_Management.service;

import com.example.Complaint_Management.config.JwtService;
import com.example.Complaint_Management.dto.Request.LoginRequest;
import com.example.Complaint_Management.dto.Request.RegisterRequest;
import com.example.Complaint_Management.dto.Response.AuthResponse;
import com.example.Complaint_Management.entity.User;
import com.example.Complaint_Management.enums.Role;
import com.example.Complaint_Management.exception.InvalidOperationException;
import com.example.Complaint_Management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new InvalidOperationException(
                    "Username already taken: " + request.getUsername());
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new InvalidOperationException(
                    "Phone already registered: " + request.getPhone());
        }

        // WARD_MEMBER must have a ward assigned
        if (request.getRole() == Role.WARD_MEMBER
                && (request.getWardId() == null || request.getWardId().isBlank())) {
            throw new InvalidOperationException(
                    "wardId is required when registering a WARD_MEMBER");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .wardId(request.getWardId())
                .wardName(request.getWardName())
                .enabled(true)
                .build();

        user = userRepository.save(user);
        log.info("Registered new {} account: {}", user.getRole(), user.getUsername());

        String token = jwtService.generateToken(
                user.getId(), user.getUsername(), user.getPhone(),
                user.getWardId(), user.getRole().name());

        return buildResponse(user, token);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isEnabled()) {
            throw new BadCredentialsException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(
                user.getId(), user.getUsername(), user.getPhone(),
                user.getWardId(), user.getRole().name());

        log.info("{} logged in: {}", user.getRole(), user.getUsername());
        return buildResponse(user, token);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .wardId(user.getWardId())
                .wardName(user.getWardName())
                .build();
    }
}
