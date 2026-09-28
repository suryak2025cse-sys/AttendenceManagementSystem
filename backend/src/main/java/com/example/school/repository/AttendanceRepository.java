package com.example.school.repository;

import com.example.school.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, String status);
    long countByDateAndStatus(LocalDate date, String status);
    long countByStatus(String status);
}
