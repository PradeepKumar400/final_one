package com.example.Complaint_Management.blockchain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderDTO {
    private String id;
    private String fundRequestId;
    private String contractorName;
    private Double allocatedAmount;
    private String beforePhotoHash; // IPFS CID
    private String afterPhotoHash; // IPFS CID
    private String status; // CREATED, IN_PROGRESS, COMPLETED
    private Double actualAmountSpent;
    private String completionDate;
}
