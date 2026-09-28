package com.example.school.controller;

import com.example.school.model.Notification;
import com.example.school.repository.NotificationRepository;
import com.example.school.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final NotificationRepository notificationRepository;

    @Autowired
    public ReportController(ReportService reportService, NotificationRepository notificationRepository) {
        this.reportService = reportService;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/financial")
    public ResponseEntity<Map<String, Object>> getFinancialReport() {
        Map<String, Object> report = reportService.getFinancialReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationRepository.findAll();
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/notifications/student/{studentId}")
    public ResponseEntity<List<Notification>> getNotificationsByStudentId(@PathVariable Long studentId) {
        List<Notification> notifications = notificationRepository.findByStudentId(studentId);
        return ResponseEntity.ok(notifications);
    }
}
