package com.example.Complaint_Management.controller;

import com.example.Complaint_Management.dto.Response.ApiResponse;
import com.example.Complaint_Management.entity.User;
import com.example.Complaint_Management.enums.WalletStatus;
import com.example.Complaint_Management.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.Complaint_Management.config.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/blockchain/identity")
@RequiredArgsConstructor
@Slf4j
public class BlockchainIdentityController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Data
    public static class WalletSetupRequest {
        private String setupToken;
        private String walletAddress;
    }

    /**
     * Called by Ward Member's browser after generating wallet locally.
     * Receives ONLY the public address — never the private key.
     */
    @PostMapping("/setup-wallet")
    public ResponseEntity<ApiResponse<Map<String, String>>> setupWallet(@RequestBody WalletSetupRequest req) {
        log.info("Received wallet setup request for token: {}", req.getSetupToken());

        User user = userRepository.findByWalletSetupToken(req.getSetupToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired setup token"));

        if (user.getWalletStatus() == WalletStatus.ACTIVE) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Wallet already set up"));
        }

        // Basic validation of Ethereum address format
        if (req.getWalletAddress() == null || !req.getWalletAddress().startsWith("0x")
                || req.getWalletAddress().length() != 42) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid blockchain wallet address format"));
        }

        user.setWalletAddress(req.getWalletAddress());
        user.setWalletStatus(WalletStatus.ACTIVE);
        user.setWalletSetupToken(null); // Invalidate token after successful use

        userRepository.save(user);

        log.info("Wallet setup complete for user: {}. Address: {}", user.getUsername(), user.getWalletAddress());

        return ResponseEntity.ok(
                ApiResponse.success("Wallet setup complete locally. Please contact Admin to activate on blockchain.",
                        Map.of("address", req.getWalletAddress())));
    }

    /**
     * Helper to verify a token is valid before showing the setup page.
     */
    @GetMapping("/verify-token/{token}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyToken(@PathVariable String token) {
        return userRepository.findByWalletSetupToken(token)
                .map(user -> {
                    Map<String, Object> data = Map.of(
                            "username", user.getUsername(),
                            "fullName", user.getFullName(),
                            "role", user.getRole());
                    return ResponseEntity.ok(ApiResponse.success("Token valid", data));
                })
                .orElse(ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired token")));
    }

    @PostMapping("/connect-wallet")
    public ResponseEntity<?> connectWallet(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        try {
            // ── Step 1: Get logged-in user from JWT ──
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            String token = authHeader.substring(7);
            String userId = jwtService.extractUserId(token);

            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token session"));
            }

            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // ── Step 2: Validate the wallet address format ──
            String walletAddress = body.get("walletAddress");
            if (walletAddress == null || walletAddress.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Wallet address is required"));
            }
            if (!walletAddress.startsWith("0x") || walletAddress.length() != 42) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid wallet address format"));
            }
            walletAddress = walletAddress.toLowerCase();

            // ── Step 3: If this user already has a wallet, just return it ──
            if (user.getWalletAddress() != null) {
                if (!user.getWalletAddress().equalsIgnoreCase(walletAddress)) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "Wrong wallet! Your registered wallet is: " + user.getWalletAddress()
                    ));
                }
                return ResponseEntity.ok(Map.of(
                        "message", "Wallet already connected",
                        "walletAddress", user.getWalletAddress(),
                        "status", "VERIFIED"
                ));
            }

            // ── Step 4: Check if another user already owns this wallet ──
            boolean alreadyTaken = userRepository.existsByWalletAddress(walletAddress);
            if (alreadyTaken) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "This wallet address is already linked to another account. Please use a different MetaMask account."
                ));
            }

            // ── Step 5: Save wallet address to this user ──
            user.setWalletAddress(walletAddress);
            user.setWalletStatus(WalletStatus.ACTIVE);
            userRepository.save(user);

            log.info("Wallet {} connected for user {}", walletAddress, user.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "Wallet connected successfully",
                    "walletAddress", walletAddress,
                    "status", "ACTIVE"
            ));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "This wallet is already linked to another account. Please use a different MetaMask account."
            ));
        } catch (Exception e) {
            log.error("Wallet connection failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Wallet connection failed: " + e.getMessage()
            ));
        }
    }
}
