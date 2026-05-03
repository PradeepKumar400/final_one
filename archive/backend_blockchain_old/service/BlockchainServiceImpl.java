package com.example.Complaint_Management.blockchain.service;

import com.example.Complaint_Management.blockchain.dto.BlockchainResponse;
import com.example.Complaint_Management.blockchain.dto.FundRequestDTO;
import com.example.Complaint_Management.blockchain.dto.VoteDTO;
import com.example.Complaint_Management.blockchain.dto.WorkOrderDTO;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import lombok.RequiredArgsConstructor;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BlockchainServiceImpl implements BlockchainService {

    @Autowired(required = false)
    private Gateway gateway; // Can be null if Fabric is not configured yet
    
    private final Gson gson = new Gson();
    
    // In-memory store for Mock Implementation
    private final List<FundRequestDTO> mockFundStore = new ArrayList<>();
    private final List<WorkOrderDTO> mockWorkOrderStore = new ArrayList<>();

    // Helper to simulate IPFS CID generation
    private String generateMockIPFSHash(String content) {
        return "Qm" + UUID.randomUUID().toString().replace("-", "").substring(0, 44);
    }

    @Value("${fabric.channel.name:mychannel}")
    private String channelName;

    @Value("${fabric.contract.name:fundcontract}")
    private String contractName;

    private Contract getContract() {
        if (gateway == null) {
            return null;
        }
        Network network = gateway.getNetwork(channelName);
        return network.getContract(contractName);
    }

    @Override
    public BlockchainResponse<FundRequestDTO> submitFundRequest(FundRequestDTO request) {
        if (request.getId() == null || request.getId().isEmpty()) {
            request.setId("FUND-" + UUID.randomUUID().toString().substring(0, 8));
        }
        
        Contract contract = getContract();
        if (contract != null) {
            try {
                String requestJson = gson.toJson(request);
                byte[] result = contract.submitTransaction("CreateFundRequest", requestJson);
                FundRequestDTO savedRequest = gson.fromJson(new String(result, StandardCharsets.UTF_8), FundRequestDTO.class);
                return createSuccessResponse(savedRequest, "Fund request submitted to blockchain.");
            } catch (Exception e) {
                return createErrorResponse(e.getMessage());
            }
        }
        
        // Mock Implementation Fallback
        request.setStatus("PENDING");
        request.setVotes(new ArrayList<>());
        mockFundStore.add(request);
        return createSuccessResponse(request, "MOCK: Fund request submitted.");
    }

    @Override
    public BlockchainResponse<List<FundRequestDTO>> getPendingFundRequests() {
        Contract contract = getContract();
        if (contract != null) {
            try {
                byte[] result = contract.evaluateTransaction("GetPendingFundRequests");
                Type listType = new TypeToken<ArrayList<FundRequestDTO>>(){}.getType();
                List<FundRequestDTO> list = gson.fromJson(new String(result, StandardCharsets.UTF_8), listType);
                return createSuccessResponse(list, "Fetched pending requests.");
            } catch (Exception e) {
                return createErrorResponse(e.getMessage());
            }
        }
        
        // Mock Implementation Fallback
        List<FundRequestDTO> pending = new ArrayList<>();
        for (FundRequestDTO f : mockFundStore) {
            if ("PENDING".equals(f.getStatus())) {
                pending.add(f);
            }
        }
        return createSuccessResponse(pending, "MOCK: Fetched pending requests.");
    }

    @Override
    public BlockchainResponse<FundRequestDTO> castVote(String fundRequestId, VoteDTO vote) {
        Contract contract = getContract();
        if (contract != null) {
            try {
                String voteJson = gson.toJson(vote);
                byte[] result = contract.submitTransaction("CastVote", fundRequestId, voteJson);
                FundRequestDTO updatedRequest = gson.fromJson(new String(result, StandardCharsets.UTF_8), FundRequestDTO.class);
                return createSuccessResponse(updatedRequest, "Vote cast successfully.");
            } catch (Exception e) {
                return createErrorResponse(e.getMessage());
            }
        }
        
        // Mock Implementation Fallback
        FundRequestDTO target = null;
        for (FundRequestDTO f : mockFundStore) {
            if (f.getId().equals(fundRequestId)) {
                target = f;
                break;
            }
        }
        
        if (target != null && "PENDING".equals(target.getStatus())) {
            // Enforce "one member, one vote"
            boolean alreadyVoted = target.getVotes().stream()
                .anyMatch(v -> v.getWardMemberId().equals(vote.getWardMemberId()));
            
            if (alreadyVoted) {
                return createErrorResponse("You have already voted on this fund request.");
            }

            target.getVotes().add(vote);
            
            // Check consensus (4 out of 6 for APPROVE)
            long approveCount = target.getVotes().stream().filter(v -> "APPROVE".equals(v.getVote())).count();
            long rejectCount = target.getVotes().stream().filter(v -> "REJECT".equals(v.getVote())).count();
            if (approveCount >= 4) target.setStatus("APPROVED");
            else if (rejectCount >= 3) target.setStatus("REJECTED");
        }
        
        return createSuccessResponse(target != null ? target : new FundRequestDTO(), "MOCK: Vote cast successfully.");
    }

    @Override
    public BlockchainResponse<List<FundRequestDTO>> getApprovedFunds() {
        Contract contract = getContract();
        if (contract != null) {
            try {
                byte[] result = contract.evaluateTransaction("GetApprovedFunds");
                Type listType = new TypeToken<ArrayList<FundRequestDTO>>(){}.getType();
                List<FundRequestDTO> list = gson.fromJson(new String(result, StandardCharsets.UTF_8), listType);
                return createSuccessResponse(list, "Fetched approved funds.");
            } catch (Exception e) {
                return createErrorResponse(e.getMessage());
            }
        }
        
        // Mock Implementation Fallback
        List<FundRequestDTO> approved = new ArrayList<>();
        for (FundRequestDTO f : mockFundStore) {
            if ("APPROVED".equals(f.getStatus())) {
                approved.add(f);
            }
        }
        return createSuccessResponse(approved, "MOCK: Fetched approved funds.");
    }

    @Override
    public BlockchainResponse<FundRequestDTO> getFundRequest(String id) {
        Contract contract = getContract();
        if (contract != null) {
            try {
                byte[] result = contract.evaluateTransaction("GetFundRequest", id);
                FundRequestDTO request = gson.fromJson(new String(result, StandardCharsets.UTF_8), FundRequestDTO.class);
                return createSuccessResponse(request, "Fetched fund request.");
            } catch (Exception e) {
                return createErrorResponse(e.getMessage());
            }
        }
        return createSuccessResponse(new FundRequestDTO(), "MOCK: Fetched fund request.");
    }

    @Override
    public BlockchainResponse<List<VoteDTO>> getVotesForFund(String id) {
        Contract contract = getContract();
        if (contract != null) {
            try {
                byte[] result = contract.evaluateTransaction("GetVotesForFund", id);
                Type listType = new TypeToken<ArrayList<VoteDTO>>(){}.getType();
                List<VoteDTO> list = gson.fromJson(new String(result, StandardCharsets.UTF_8), listType);
                return createSuccessResponse(list, "Fetched votes.");
            } catch (Exception e) {
                return createErrorResponse(e.getMessage());
            }
        }
        return createSuccessResponse(new ArrayList<>(), "MOCK: Fetched votes.");
    }

    @Override
    public BlockchainResponse<Object> getFundHistory(String id) {
        Contract contract = getContract();
        if (contract != null) {
            try {
                byte[] result = contract.evaluateTransaction("GetFundHistory", id);
                Object history = gson.fromJson(new String(result, StandardCharsets.UTF_8), Object.class);
                return createSuccessResponse(history, "Fetched fund history.");
            } catch (Exception e) {
                return createErrorResponse(e.getMessage());
            }
        }
        return createSuccessResponse(new Object(), "MOCK: Fetched fund history.");
    }

    @Override
    public BlockchainResponse<WorkOrderDTO> createWorkOrder(String fundRequestId, WorkOrderDTO workOrder) {
        if (workOrder.getId() == null || workOrder.getId().isEmpty()) {
            workOrder.setId("WO-" + UUID.randomUUID().toString().substring(0, 8));
        }
        workOrder.setFundRequestId(fundRequestId);
        
        Contract contract = getContract();
        if (contract != null) {
            try {
                String workOrderJson = gson.toJson(workOrder);
                byte[] result = contract.submitTransaction("CreateWorkOrder", workOrderJson);
                WorkOrderDTO savedWO = gson.fromJson(new String(result, StandardCharsets.UTF_8), WorkOrderDTO.class);
                return createSuccessResponse(savedWO, "Work order created on blockchain.");
            } catch (Exception e) {
                return createErrorResponse(e.getMessage());
            }
        }
        
        workOrder.setStatus("CREATED");
        workOrder.setBeforePhotoHash(generateMockIPFSHash("before-" + workOrder.getId())); // Simulate IPFS
        mockWorkOrderStore.add(workOrder);
        return createSuccessResponse(workOrder, "MOCK: Work order created.");
    }

    @Override
    public BlockchainResponse<WorkOrderDTO> completeWorkOrder(String workOrderId, WorkOrderDTO completionDetails) {
        Contract contract = getContract();
        if (contract != null) {
            try {
                String detailsJson = gson.toJson(completionDetails);
                byte[] result = contract.submitTransaction("CompleteWorkOrder", workOrderId, detailsJson);
                WorkOrderDTO updatedWO = gson.fromJson(new String(result, StandardCharsets.UTF_8), WorkOrderDTO.class);
                return createSuccessResponse(updatedWO, "Work order completed on blockchain.");
            } catch (Exception e) {
                return createErrorResponse(e.getMessage());
            }
        }
        
        // Mock Implementation Fallback
        for (WorkOrderDTO wo : mockWorkOrderStore) {
            if (wo.getId().equals(workOrderId)) {
                wo.setStatus("COMPLETED");
                wo.setActualAmountSpent(completionDetails.getActualAmountSpent());
                wo.setAfterPhotoHash(generateMockIPFSHash("after-" + workOrderId)); // Simulate IPFS
                wo.setCompletionDate(UUID.randomUUID().toString()); // Mock date
                return createSuccessResponse(wo, "MOCK: Work order completed.");
            }
        }
        return createErrorResponse("Work order not found");
    }

    private <T> BlockchainResponse<T> createSuccessResponse(T data, String message) {
        BlockchainResponse<T> response = new BlockchainResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setData(data);
        response.setTransactionId(UUID.randomUUID().toString()); // Mocking TxID
        return response;
    }

    private <T> BlockchainResponse<T> createErrorResponse(String errorMessage) {
        BlockchainResponse<T> response = new BlockchainResponse<>();
        response.setSuccess(false);
        response.setMessage("Blockchain error: " + errorMessage);
        return response;
    }
}
