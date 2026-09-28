package com.example.school.controller;

import com.example.school.model.Fee;
import com.example.school.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService feeService;

    @Autowired
    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @PostMapping("/invoice")
    public ResponseEntity<Fee> createInvoice(@RequestBody Fee fee) {
        Fee saved = feeService.createInvoice(fee);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/payment")
    public ResponseEntity<?> recordPayment(@RequestBody Map<String, Object> payload) {
        Long feeId = null;
        if (payload.containsKey("feeId")) {
            feeId = Long.valueOf(payload.get("feeId").toString());
        } else if (payload.containsKey("id")) {
            feeId = Long.valueOf(payload.get("id").toString());
        }

        if (feeId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fee ID must be provided in request body"));
        }

        Fee paidFee = feeService.recordPayment(feeId);
        if (paidFee != null) {
            return ResponseEntity.ok(paidFee);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Fee record not found with ID: " + feeId));
    }

    @GetMapping
    public ResponseEntity<List<Fee>> getAllFees() {
        List<Fee> fees = feeService.getAllFees();
        return ResponseEntity.ok(fees);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Fee>> getFeesByStudentId(@PathVariable Long studentId) {
        List<Fee> fees = feeService.getFeesByStudentId(studentId);
        return ResponseEntity.ok(fees);
    }
}
