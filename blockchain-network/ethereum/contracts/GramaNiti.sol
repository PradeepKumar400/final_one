// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GramaNiti {
    
    enum Status { PENDING, APPROVED, REJECTED, COMPLETED }
    
    struct GenesisFund {
        uint256 id;
        uint256 amount;
        uint256 timestamp;
        string source;
        string ref;
    }

    struct FundRequest {
        uint256 id;
        string transactionId; // Unique ID from Backend
        address requester; // President
        uint256 amount;
        string purpose;
        string workOrderIpfsHash; // Optional initially, updated on completion
        uint256 approveCount;
        uint256 rejectCount;
        Status status;
        uint256 timestamp;
        uint256 totalMembers;
    }
    
    mapping(uint256 => FundRequest) public fundRequests;
    uint256 public requestCount;
    
    mapping(uint256 => GenesisFund) public genesisFunds;
    uint256 public genesisCount;

    // mapping request ID -> member address -> hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    event FundRecorded(uint256 id, uint256 amount, string source, string ref);
    event RequestCreated(uint256 id, string transactionId, address requester, uint256 amount, string purpose);
    event Voted(uint256 id, address voter, bool approve);
    event RequestStatusChanged(uint256 id, Status newStatus);
    event WorkOrderUpdated(uint256 id, string ipfsHash);
    
    // Step 1: Admin records the total amount received from Government
    function recordGenesisFund(uint256 _amount, string memory _source, string memory _ref) public {
        genesisCount++;
        genesisFunds[genesisCount] = GenesisFund({
            id: genesisCount,
            amount: _amount,
            timestamp: block.timestamp,
            source: _source,
            ref: _ref
        });
        emit FundRecorded(genesisCount, _amount, _source, _ref);
    }

    // Step 2: President creates a Fund Request
    function createRequest(string memory _transactionId, uint256 _amount, string memory _purpose, uint256 _totalMembers) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(_totalMembers > 0, "Total members must be greater than 0");
        
        requestCount++;
        fundRequests[requestCount] = FundRequest({
            id: requestCount,
            transactionId: _transactionId,
            requester: msg.sender,
            amount: _amount,
            purpose: _purpose,
            workOrderIpfsHash: "",
            approveCount: 0,
            rejectCount: 0,
            status: Status.PENDING,
            timestamp: block.timestamp,
            totalMembers: _totalMembers
        });
        
        emit RequestCreated(requestCount, _transactionId, msg.sender, _amount, _purpose);
    }
    
    // Step 3 & 4: Ward Members vote and Proof of Validation Consensus
    function vote(uint256 _requestId, bool _approve) public {
        require(_requestId > 0 && _requestId <= requestCount, "Invalid request ID");
        FundRequest storage req = fundRequests[_requestId];
        require(req.status == Status.PENDING, "Request not pending");
        require(!hasVoted[_requestId][msg.sender], "Already voted");
        
        hasVoted[_requestId][msg.sender] = true;
        
        if (_approve) {
            req.approveCount++;
        } else {
            req.rejectCount++;
        }
        
        emit Voted(_requestId, msg.sender, _approve);
        
        // Step 4: Consensus logic (e.g. 51% of members)
        // If 6 members, threshold is 4. If 10 members, threshold is 6.
        uint256 threshold = (req.totalMembers / 2) + 1;
        
        if (req.approveCount >= threshold) {
            req.status = Status.APPROVED;
            emit RequestStatusChanged(_requestId, Status.APPROVED);
        } else if (req.rejectCount >= threshold) {
            req.status = Status.REJECTED;
            emit RequestStatusChanged(_requestId, Status.REJECTED);
        }
    }
    
    // Step 5: Update with Proof (IPFS) and mark as COMPLETED
    function updateWorkOrder(uint256 _requestId, string memory _ipfsHash) public {
        require(_requestId > 0 && _requestId <= requestCount, "Invalid request ID");
        FundRequest storage req = fundRequests[_requestId];
        require(req.status == Status.APPROVED, "Request must be approved");
        require(msg.sender == req.requester, "Only requester can update");
        
        req.workOrderIpfsHash = _ipfsHash;
        req.status = Status.COMPLETED;
        
        emit WorkOrderUpdated(_requestId, _ipfsHash);
        emit RequestStatusChanged(_requestId, Status.COMPLETED);
    }
    
    function getAllRequests() public view returns (FundRequest[] memory) {
        if (requestCount == 0) {
            return new FundRequest[](0);
        }
        
        FundRequest[] memory requests = new FundRequest[](requestCount);
        for (uint256 i = 1; i <= requestCount; i++) {
            requests[i - 1] = fundRequests[i];
        }
        return requests;
    }

    function getAllGenesisFunds() public view returns (GenesisFund[] memory) {
        GenesisFund[] memory funds = new GenesisFund[](genesisCount);
        for (uint256 i = 1; i <= genesisCount; i++) {
            funds[i - 1] = genesisFunds[i];
        }
        return funds;
    }
}


