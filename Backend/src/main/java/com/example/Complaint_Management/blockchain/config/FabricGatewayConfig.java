package com.example.Complaint_Management.blockchain.config;

import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Wallet;
import org.hyperledger.fabric.gateway.Wallets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FabricGatewayConfig {

    @Value("${fabric.wallet.path:wallet}")
    private String walletPath;

    @Value("${fabric.network.config.path:connection.json}")
    private String networkConfigPath;

    @Value("${fabric.user.name:admin}")
    private String userName;

    @Bean
    public Gateway gateway() {
        try {
            Path walletDirectory = Paths.get(walletPath);
            Wallet wallet = Wallets.newFileSystemWallet(walletDirectory);

            Path networkConfig = Paths.get(networkConfigPath);

            // Attempt to build gateway. If files don't exist, this will throw an exception.
            // For now, return null or a dummy gateway if not fully configured,
            // to allow Spring Boot to start for testing Complaint Management module.
            if (!networkConfig.toFile().exists()) {
                System.err.println("Fabric network config not found at: " + networkConfigPath + ". Returning null Gateway.");
                return null;
            }

            Gateway.Builder builder = Gateway.createBuilder();
            builder.identity(wallet, userName).networkConfig(networkConfig).discovery(true);

            return builder.connect();
        } catch (Exception e) {
            System.err.println("Failed to connect to Fabric gateway: " + e.getMessage());
            return null; // Return null so app can still boot
        }
    }
}
