package com.example.school.service;

import com.example.school.model.Attendance;
import com.example.school.model.Notification;
import com.example.school.model.Student;
import com.example.school.repository.AttendanceRepository;
import com.example.school.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final WhatsAppService whatsAppService;

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository,
                             WhatsAppService whatsAppService) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.whatsAppService = whatsAppService;
    }

    /**
     * Marks student attendance and triggers an automated Meta WhatsApp notification if the student is ABSENT.
     */
    public Attendance markAttendance(Attendance attendance) {
        // 1. Store the attendance in MySQL
        Attendance savedAttendance = attendanceRepository.save(attendance);

        // 2. Identify if student is marked ABSENT
        if ("ABSENT".equalsIgnoreCase(attendance.getStatus())) {
            // 3. Retrieve student's parent phone number from database
            Optional<Student> studentOpt = studentRepository.findById(attendance.getStudentId());
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                // 4 & 5. Send WhatsApp notification via Meta Cloud API & store status
                whatsAppService.sendAbsentNotification(
                        student.getId(),
                        student.getName(),
                        student.getParentPhone(),
                        attendance.getDate()
                );
            }
        }

        return savedAttendance;
    }

    public List<Attendance> getAttendanceByStudentId(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    /**
     * Calculates attendance percentage for a given student.
     */
    public Map<String, Object> getAttendancePercentage(Long studentId) {
        Map<String, Object> response = new HashMap<>();

        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            response.put("error", "Student not found with ID: " + studentId);
            return response;
        }

        Student student = studentOpt.get();
        long totalDays = attendanceRepository.countByStudentId(studentId);
        long presentDays = attendanceRepository.countByStudentIdAndStatus(studentId, "PRESENT");
        long absentDays = attendanceRepository.countByStudentIdAndStatus(studentId, "ABSENT");

        double percentage = 0.0;
        if (totalDays > 0) {
            percentage = Math.round(((double) presentDays / totalDays) * 1000.0) / 10.0;
        }

        response.put("student", student.getName());
        response.put("totalDays", totalDays);
        response.put("presentDays", presentDays);
        response.put("absentDays", absentDays);
        response.put("attendancePercentage", percentage);

        return response;
    }
}
