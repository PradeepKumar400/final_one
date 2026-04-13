package com.example.Complaint_Management.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Generates and validates JWT tokens.
 * Tokens embed: userId, phone, wardId (ward members), and roles.
 */
@Component
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    /** Token validity: 24 hours */
    private static final long EXPIRY_MS = 24 * 60 * 60 * 1000L;

    public String generateToken(UUID userId, String username, String phone,
                                String wardId, String role) {
        Map<String, Object> claims = new java.util.LinkedHashMap<>();
        claims.put("userId", userId.toString());
        claims.put("phone", phone);
        claims.put("roles", List.of(role));
        if (wardId != null) {
            claims.put("wardId", wardId);
        }

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)),
                        SignatureAlgorithm.HS256)
                .compact();
    }
}
