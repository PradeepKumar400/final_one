package com.example.Complaint_Management.blockchain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteDTO {
    private String wardMemberId;
    private String vote; // APPROVE, REJECT
    private String timestamp;
}
