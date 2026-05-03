package com.example.Complaint_Management.blockchain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainResponse<T> {
    private boolean success;
    private String message;
    private String transactionId;
    private T data;
}
