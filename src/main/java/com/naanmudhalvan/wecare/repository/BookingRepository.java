package com.naanmudhalvan.wecare.repository;

import com.naanmudhalvan.wecare.entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    List<BookingEntity> findByUserId(Long userId);
    List<BookingEntity> findByCoachId(Long coachId);
    Optional<BookingEntity> findByCoachIdAndAppointmentDateAndSlotAndStatusNot(
            Long coachId, LocalDate appointmentDate, String slot, String status);
}
