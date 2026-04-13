package com.example.Complaint_Management.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();

            // Extract userId — set during login by AuthService
            String userIdStr = claims.get("userId", String.class);
            UUID userId = userIdStr != null ? UUID.fromString(userIdStr) : null;

            // Extract phone
            String phone = claims.get("phone", String.class);

            // Extract wardId — only present for WARD_MEMBER tokens
            String wardId = claims.get("wardId", String.class);

            // Extract roles — stored as List<String> e.g. ["WARD_MEMBER"]
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);

            List<SimpleGrantedAuthority> authorities = (roles != null)
                    ? roles.stream()
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                        .collect(Collectors.toList())
                    : List.of();

            CustomUserDetails userDetails = new CustomUserDetails(
                    userId, username, "", phone, wardId, authorities);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}
