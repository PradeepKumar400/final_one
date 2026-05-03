package com.example.Complaint_Management.blockchain.controller;

import com.example.Complaint_Management.blockchain.dto.BlockchainResponse;
import com.example.Complaint_Management.blockchain.dto.FundRequestDTO;
import com.example.Complaint_Management.blockchain.dto.VoteDTO;
import com.example.Complaint_Management.blockchain.dto.WorkOrderDTO;
import com.example.Complaint_Management.blockchain.service.BlockchainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/blockchain")
@RequiredArgsConstructor
@CrossOrigin("*") // Adjust for production
public class BlockchainController {

    private final BlockchainService blockchainService;

    @PostMapping("/funds/request")
    public ResponseEntity<BlockchainResponse<FundRequestDTO>> submitFundRequest(@RequestBody FundRequestDTO request) {
        return ResponseEntity.ok(blockchainService.submitFundRequest(request));
    }

    @GetMapping("/funds/pending")
    public ResponseEntity<BlockchainResponse<List<FundRequestDTO>>> getPendingFunds() {
        return ResponseEntity.ok(blockchainService.getPendingFundRequests());
    }

    @PostMapping("/funds/{id}/vote")
    public ResponseEntity<BlockchainResponse<FundRequestDTO>> castVote(
            @PathVariable String id, @RequestBody VoteDTO vote) {
        return ResponseEntity.ok(blockchainService.castVote(id, vote));
    }

    @GetMapping("/funds/approved")
    public ResponseEntity<BlockchainResponse<List<FundRequestDTO>>> getApprovedFunds() {
        return ResponseEntity.ok(blockchainService.getApprovedFunds());
    }

    @GetMapping("/funds/{id}")
    public ResponseEntity<BlockchainResponse<FundRequestDTO>> getFundRequest(@PathVariable String id) {
        return ResponseEntity.ok(blockchainService.getFundRequest(id));
    }

    @GetMapping("/funds/{id}/votes")
    public ResponseEntity<BlockchainResponse<List<VoteDTO>>> getVotes(@PathVariable String id) {
        return ResponseEntity.ok(blockchainService.getVotesForFund(id));
    }

    @GetMapping("/funds/{id}/history")
    public ResponseEntity<BlockchainResponse<Object>> getFundHistory(@PathVariable String id) {
        return ResponseEntity.ok(blockchainService.getFundHistory(id));
    }

    @PostMapping("/funds/{id}/work-order")
    public ResponseEntity<BlockchainResponse<WorkOrderDTO>> createWorkOrder(
            @PathVariable String id, @RequestBody WorkOrderDTO workOrder) {
        return ResponseEntity.ok(blockchainService.createWorkOrder(id, workOrder));
    }

    @PutMapping("/work-orders/{id}/complete")
    public ResponseEntity<BlockchainResponse<WorkOrderDTO>> completeWorkOrder(
            @PathVariable String id, @RequestBody WorkOrderDTO completionDetails) {
        return ResponseEntity.ok(blockchainService.completeWorkOrder(id, completionDetails));
    }
}
