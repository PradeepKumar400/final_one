package com.example.Complaint_Management.blockchain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundRequestDTO {
    private String id;
    private String purpose;
    private Double amount;
    private String wardId;
    private String documentHash; // IPFS CID
    private String presidentId;
    private String status; // PENDING, APPROVED, REJECTED, EXPIRED
    private String createdAt;
    private List<VoteDTO> votes;
}
