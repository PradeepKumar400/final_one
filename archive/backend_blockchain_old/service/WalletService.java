package com.example.Complaint_Management.blockchain.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.*;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class WalletService {

    /**
     * Generates a new ECDSA KeyPair for a user.
     * ECDSA is the industry standard for blockchain identity.
     */
    public WalletKeyPair generateWallet() throws NoSuchAlgorithmException {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("EC");
        SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
        keyGen.initialize(256, random);

        KeyPair pair = keyGen.generateKeyPair();
        PrivateKey privateKey = pair.getPrivate();
        PublicKey publicKey = pair.getPublic();

        String walletId = "WL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String pubStr = Base64.getEncoder().encodeToString(publicKey.getEncoded());
        String privStr = Base64.getEncoder().encodeToString(privateKey.getEncoded());

        return new WalletKeyPair(walletId, pubStr, privStr);
    }

    /**
     * Verifies a digital signature against a public key.
     */
    public boolean verifySignature(String publicKeyStr, String data, String signatureStr) {
        try {
            byte[] publicBytes = Base64.getDecoder().decode(publicKeyStr);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("EC");
            PublicKey publicKey = keyFactory.generatePublic(keySpec);

            Signature ecdsaVerify = Signature.getInstance("SHA256withECDSA");
            ecdsaVerify.initVerify(publicKey);
            ecdsaVerify.update(data.getBytes());

            return ecdsaVerify.verify(Base64.getDecoder().decode(signatureStr));
        } catch (Exception e) {
            return false;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class WalletKeyPair {
        private String walletId;
        private String publicKey;
        private String privateKey;
    }
}
