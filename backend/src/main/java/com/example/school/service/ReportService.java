package com.example.school.service;

import com.example.school.repository.ExpenseRepository;
import com.example.school.repository.FeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {

    private final FeeRepository feeRepository;
    private final ExpenseRepository expenseRepository;

    @Autowired
    public ReportService(FeeRepository feeRepository, ExpenseRepository expenseRepository) {
        this.feeRepository = feeRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Calculates the overall financial report:
     * totalFees (Paid only) - totalExpenses = netBalance
     */
    public Map<String, Object> getFinancialReport() {
        Double totalFees = feeRepository.sumPaidFees();
        Double totalExpenses = expenseRepository.sumExpenses();
        Double pendingFees = feeRepository.sumPendingFees();

        if (totalFees == null) totalFees = 0.0;
        if (totalExpenses == null) totalExpenses = 0.0;
        if (pendingFees == null) pendingFees = 0.0;

        double netBalance = totalFees - totalExpenses;

        Map<String, Object> report = new HashMap<>();
        report.put("totalFees", totalFees);
        report.put("totalExpenses", totalExpenses);
        report.put("pendingFees", pendingFees);
        report.put("netBalance", netBalance);

        return report;
    }
}
