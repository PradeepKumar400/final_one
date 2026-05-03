package com.example.Complaint_Management.blockchain.service;

import com.example.Complaint_Management.blockchain.dto.BlockchainResponse;
import com.example.Complaint_Management.blockchain.dto.FundRequestDTO;
import com.example.Complaint_Management.blockchain.dto.VoteDTO;
import com.example.Complaint_Management.blockchain.dto.WorkOrderDTO;

import java.util.List;

public interface BlockchainService {
    
    // Sub-module 1.2 — Fund Allocation
    BlockchainResponse<FundRequestDTO> submitFundRequest(FundRequestDTO request);
    BlockchainResponse<List<FundRequestDTO>> getPendingFundRequests();
    BlockchainResponse<FundRequestDTO> castVote(String fundRequestId, VoteDTO vote);
    BlockchainResponse<List<FundRequestDTO>> getApprovedFunds();
    BlockchainResponse<FundRequestDTO> getFundRequest(String id);
    BlockchainResponse<List<VoteDTO>> getVotesForFund(String id);
    BlockchainResponse<Object> getFundHistory(String id); // Returns audit trail

    // Sub-module 1.3 — Fund Utilisation & Work Order
    BlockchainResponse<WorkOrderDTO> createWorkOrder(String fundRequestId, WorkOrderDTO workOrder);
    BlockchainResponse<WorkOrderDTO> completeWorkOrder(String workOrderId, WorkOrderDTO completionDetails);
}
