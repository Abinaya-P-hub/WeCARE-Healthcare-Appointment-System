package com.naanmudhalvan.wecare.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class BookingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long coachId;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column(nullable = false, length = 30)
    private String slot;

    @Column(nullable = false, length = 20)
    private String status;

    public BookingEntity() {}

    public BookingEntity(Long bookingId, Long userId, Long coachId, LocalDate appointmentDate, String slot, String status) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.coachId = coachId;
        this.appointmentDate = appointmentDate;
        this.slot = slot;
        this.status = status;
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCoachId() { return coachId; }
    public void setCoachId(Long coachId) { this.coachId = coachId; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
