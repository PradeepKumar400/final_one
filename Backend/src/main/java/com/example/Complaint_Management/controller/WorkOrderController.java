package com.example.Complaint_Management.controller;

import com.example.Complaint_Management.entity.WorkOrder;
import com.example.Complaint_Management.repository.WorkOrderRepository;
import com.example.Complaint_Management.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkOrderController {

    private final WorkOrderRepository workOrderRepository;
    private final PhotoService photoService;

    @PostMapping
    public ResponseEntity<WorkOrder> createWorkOrder(
            @RequestParam("transactionId") String transactionId,
            @RequestParam("purpose") String purpose,
            @RequestParam("amount") Double amount,
            @RequestParam(value = "beforeImage", required = false) MultipartFile beforeImage) {
        
        WorkOrder order = new WorkOrder();
        order.setTransactionId(transactionId);
        order.setPurpose(purpose);
        order.setAmount(amount);
        order.setStatus("PENDING");

        if (beforeImage != null && !beforeImage.isEmpty()) {
            PhotoService.UploadResult res = photoService.upload(beforeImage, "workorders");
            // Mock IPFS Hash - In real world, use IPFS SDK
            order.setBeforeImageIpfsHash("ipfs://" + UUID.randomUUID().toString() + "-" + res.getPublicId());
        }

        return ResponseEntity.ok(workOrderRepository.save(order));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<WorkOrder> completeWorkOrder(
            @PathVariable Long id,
            @RequestParam("afterImage") MultipartFile afterImage) {
        
        WorkOrder order = workOrderRepository.findById(id).orElseThrow();
        order.setStatus("COMPLETED");

        if (afterImage != null && !afterImage.isEmpty()) {
            PhotoService.UploadResult res = photoService.upload(afterImage, "workorders");
            order.setAfterImageIpfsHash("ipfs://" + UUID.randomUUID().toString() + "-" + res.getPublicId());
        }

        return ResponseEntity.ok(workOrderRepository.save(order));
    }

    @GetMapping
    public ResponseEntity<Iterable<WorkOrder>> getAllWorkOrders() {
        return ResponseEntity.ok(workOrderRepository.findAll());
    }
}
