package com.naanmudhalvan.wecare.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class BookingDTO {

    private Long bookingId;

    @NotNull(message = "User ID is mandatory")
    private Long userId;

    @NotNull(message = "Coach ID is mandatory")
    private Long coachId;

    @NotNull(message = "Appointment date is mandatory")
    @Future(message = "Appointment date must be a future date")
    private LocalDate appointmentDate;

    @NotBlank(message = "Slot is mandatory")
    private String slot;

    public BookingDTO() {}

    public BookingDTO(Long bookingId, Long userId, Long coachId, LocalDate appointmentDate, String slot) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.coachId = coachId;
        this.appointmentDate = appointmentDate;
        this.slot = slot;
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
}
