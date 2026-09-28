package com.example.school.repository;

import com.example.school.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudentId(Long studentId);
    List<Fee> findByStatus(String status);

    @Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM Fee f WHERE f.status = 'PAID'")
    Double sumPaidFees();

    @Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM Fee f WHERE f.status = 'PENDING'")
    Double sumPendingFees();
}
