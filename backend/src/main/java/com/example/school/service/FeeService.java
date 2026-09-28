package com.example.school.service;

import com.example.school.model.Fee;
import com.example.school.repository.FeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FeeService {

    private final FeeRepository feeRepository;

    @Autowired
    public FeeService(FeeRepository feeRepository) {
        this.feeRepository = feeRepository;
    }

    public Fee createInvoice(Fee fee) {
        if (fee.getStatus() == null || fee.getStatus().isBlank()) {
            fee.setStatus("PENDING");
        }
        return feeRepository.save(fee);
    }

    public Fee recordPayment(Long feeId) {
        Optional<Fee> feeOpt = feeRepository.findById(feeId);
        if (feeOpt.isPresent()) {
            Fee fee = feeOpt.get();
            fee.setStatus("PAID");
            fee.setPaymentDate(LocalDate.now());
            return feeRepository.save(fee);
        }
        return null;
    }

    public List<Fee> getFeesByStudentId(Long studentId) {
        return feeRepository.findByStudentId(studentId);
    }

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }
}
