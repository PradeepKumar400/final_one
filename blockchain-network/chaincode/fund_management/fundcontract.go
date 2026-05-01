package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"time"
)

// SmartContract provides functions for managing a FundRequest
type SmartContract struct {
	contractapi.Contract
}

// FundRequest describes basic details of what makes up a fund request
type FundRequest struct {
	ID           string   `json:"id"`
	Purpose      string   `json:"purpose"`
	Amount       float64  `json:"amount"`
	WardID       string   `json:"wardId"`
	DocumentHash string   `json:"documentHash"` // IPFS CID
	PresidentID  string   `json:"presidentId"`
	Status       string   `json:"status"` // PENDING, APPROVED, REJECTED, EXPIRED
	CreatedAt    string   `json:"createdAt"`
	Votes        []Vote   `json:"votes"`
}

// Vote describes a vote from a ward member
type Vote struct {
	WardMemberID string `json:"wardMemberId"`
	VoteValue    string `json:"vote"` // APPROVE, REJECT
	Timestamp    string `json:"timestamp"`
}

// WorkOrder describes the usage of an approved fund
type WorkOrder struct {
	ID                string  `json:"id"`
	FundRequestID     string  `json:"fundRequestId"`
	ContractorName    string  `json:"contractorName"`
	AllocatedAmount   float64 `json:"allocatedAmount"`
	BeforePhotoHash   string  `json:"beforePhotoHash"`
	AfterPhotoHash    string  `json:"afterPhotoHash"`
	Status            string  `json:"status"` // CREATED, IN_PROGRESS, COMPLETED
	ActualAmountSpent float64 `json:"actualAmountSpent"`
	CompletionDate    string  `json:"completionDate"`
}

// InitLedger adds a base set of fund requests to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	fmt.Println("Ledger initialized successfully")
	return nil
}

// CreateFundRequest issues a new fund request to the world state with given details.
func (s *SmartContract) CreateFundRequest(ctx contractapi.TransactionContextInterface, requestJSON string) (*FundRequest, error) {
	var request FundRequest
	err := json.Unmarshal([]byte(requestJSON), &request)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %v", err)
	}

	exists, err := s.FundRequestExists(ctx, request.ID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("the fund request %s already exists", request.ID)
	}

	request.Status = "PENDING"
	request.CreatedAt = time.Now().Format(time.RFC3339)
	request.Votes = []Vote{}

	requestBytes, err := json.Marshal(request)
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(request.ID, requestBytes)
	if err != nil {
		return nil, err
	}

	return &request, nil
}

// CastVote adds a vote to a pending fund request
func (s *SmartContract) CastVote(ctx contractapi.TransactionContextInterface, requestID string, voteJSON string) (*FundRequest, error) {
	request, err := s.GetFundRequest(ctx, requestID)
	if err != nil {
		return nil, err
	}

	if request.Status != "PENDING" {
		return nil, fmt.Errorf("cannot vote on request in status: %s", request.Status)
	}

	var vote Vote
	err = json.Unmarshal([]byte(voteJSON), &vote)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal vote JSON: %v", err)
	}
	
	// Check if already voted
	for _, v := range request.Votes {
		if v.WardMemberID == vote.WardMemberID {
			return nil, fmt.Errorf("ward member %s has already voted", vote.WardMemberID)
		}
	}

	vote.Timestamp = time.Now().Format(time.RFC3339)
	request.Votes = append(request.Votes, vote)

	// Check consensus (51% of 6 = 4)
	approveCount := 0
	rejectCount := 0
	for _, v := range request.Votes {
		if v.VoteValue == "APPROVE" {
			approveCount++
		} else if v.VoteValue == "REJECT" {
			rejectCount++
		}
	}

	if approveCount >= 4 {
		request.Status = "APPROVED"
	} else if rejectCount >= 3 {
		request.Status = "REJECTED"
	}

	requestBytes, err := json.Marshal(request)
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(requestID, requestBytes)
	if err != nil {
		return nil, err
	}

	return request, nil
}

// GetFundRequest returns the fund request stored in the world state with given id.
func (s *SmartContract) GetFundRequest(ctx contractapi.TransactionContextInterface, id string) (*FundRequest, error) {
	requestBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if requestBytes == nil {
		return nil, fmt.Errorf("the fund request %s does not exist", id)
	}

	var request FundRequest
	err = json.Unmarshal(requestBytes, &request)
	if err != nil {
		return nil, err
	}

	return &request, nil
}

// GetPendingFundRequests returns all pending fund requests
func (s *SmartContract) GetPendingFundRequests(ctx contractapi.TransactionContextInterface) ([]*FundRequest, error) {
	return s.queryFundsByStatus(ctx, "PENDING")
}

// GetApprovedFunds returns all approved fund requests
func (s *SmartContract) GetApprovedFunds(ctx contractapi.TransactionContextInterface) ([]*FundRequest, error) {
	return s.queryFundsByStatus(ctx, "APPROVED")
}

func (s *SmartContract) queryFundsByStatus(ctx contractapi.TransactionContextInterface, status string) ([]*FundRequest, error) {
	// Query string based on CouchDB syntax
	queryString := fmt.Sprintf(`{"selector":{"status":"%s"}}`, status)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var requests []*FundRequest
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var request FundRequest
		err = json.Unmarshal(queryResponse.Value, &request)
		if err != nil {
			return nil, err
		}
		requests = append(requests, &request)
	}

	return requests, nil
}

// CreateWorkOrder creates a new work order for an approved fund
func (s *SmartContract) CreateWorkOrder(ctx contractapi.TransactionContextInterface, workOrderJSON string) (*WorkOrder, error) {
	var workOrder WorkOrder
	err := json.Unmarshal([]byte(workOrderJSON), &workOrder)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %v", err)
	}

	// Verify fund request exists and is APPROVED
	req, err := s.GetFundRequest(ctx, workOrder.FundRequestID)
	if err != nil {
		return nil, err
	}
	if req.Status != "APPROVED" {
		return nil, fmt.Errorf("cannot create work order for non-approved fund: %s", req.Status)
	}

	workOrder.Status = "CREATED"

	woBytes, err := json.Marshal(workOrder)
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(workOrder.ID, woBytes)
	if err != nil {
		return nil, err
	}

	return &workOrder, nil
}

// CompleteWorkOrder marks a work order as completed
func (s *SmartContract) CompleteWorkOrder(ctx contractapi.TransactionContextInterface, workOrderID string, detailsJSON string) (*WorkOrder, error) {
	woBytes, err := ctx.GetStub().GetState(workOrderID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if woBytes == nil {
		return nil, fmt.Errorf("the work order %s does not exist", workOrderID)
	}

	var workOrder WorkOrder
	err = json.Unmarshal(woBytes, &workOrder)
	if err != nil {
		return nil, err
	}

	var completionDetails WorkOrder
	err = json.Unmarshal([]byte(detailsJSON), &completionDetails)
	if err != nil {
		return nil, err
	}

	workOrder.AfterPhotoHash = completionDetails.AfterPhotoHash
	workOrder.ActualAmountSpent = completionDetails.ActualAmountSpent
	workOrder.CompletionDate = time.Now().Format(time.RFC3339)
	workOrder.Status = "COMPLETED"

	updatedWOBytes, err := json.Marshal(workOrder)
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(workOrderID, updatedWOBytes)
	if err != nil {
		return nil, err
	}

	return &workOrder, nil
}

// FundRequestExists returns true when request with given ID exists in world state
func (s *SmartContract) FundRequestExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	requestBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return requestBytes != nil, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating fund management chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting fund management chaincode: %s", err.Error())
	}
}
