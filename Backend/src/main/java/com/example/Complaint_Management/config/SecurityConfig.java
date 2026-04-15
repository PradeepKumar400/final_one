
package com.example.Complaint_Management.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── CRITICAL: Allow ALL preflight OPTIONS requests ────────────
                // Must be first — browsers send OPTIONS before every cross-origin
                // request. If Spring Security blocks it, the browser reports
                // "CORS request did not succeed" with status null.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ── Auth endpoints — fully open ───────────────────────────────
                .requestMatchers("/api/v1/auth/login").permitAll()
                .requestMatchers("/api/v1/auth/register/admin").permitAll()

                // ── Public endpoints — no auth needed (citizens, open web) ────
                // Covers: /submit, /list, /track/*, /ward/*, /stats/*, /*/comment
                .requestMatchers("/api/v1/complaints/public/**").permitAll()

                // ── Citizen endpoints — no auth needed ────────────────────────
                .requestMatchers("/api/v1/complaints/citizen/**").permitAll()

                // ── Admin endpoints — ADMIN role required ─────────────────────
                .requestMatchers("/api/v1/complaints/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/auth/register").permitAll()

                // ── Ward Member endpoints — WARD_MEMBER or ADMIN role allowed ────────
                .requestMatchers("/api/v1/complaints/ward/**").hasAnyRole("WARD_MEMBER", "ADMIN")

                // ── Health probes ─────────────────────────────────────────────
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                // ── Everything else requires authentication ───────────────────
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Allow the Vite dev server (localhost:5173) and CRA (localhost:3000) to call the backend.
     *
     * Key settings:
     * - allowedOrigins: exact origins (required when allowCredentials = true)
     * - allowCredentials: true (needed if frontend sends cookies/auth headers)
     * - exposedHeaders: lets the frontend read custom response headers if needed
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",   // Vite
                "http://localhost:3000",   // CRA / other
                "http://localhost:5174"    // Vite alternate port
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // cache preflight for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
