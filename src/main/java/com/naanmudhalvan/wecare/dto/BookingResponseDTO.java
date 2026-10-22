package com.naanmudhalvan.wecare.dto;

import java.time.LocalDate;

public class BookingResponseDTO {

    private Long bookingId;
    private Long userId;
    private String userName;
    private Long coachId;
    private String coachName;
    private String specialty;
    private LocalDate appointmentDate;
    private String slot;
    private String status;

    public BookingResponseDTO() {}

    public BookingResponseDTO(Long bookingId, Long userId, String userName, Long coachId,
                              String coachName, String specialty, LocalDate appointmentDate,
                              String slot, String status) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.userName = userName;
        this.coachId = coachId;
        this.coachName = coachName;
        this.specialty = specialty;
        this.appointmentDate = appointmentDate;
        this.slot = slot;
        this.status = status;
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Long getCoachId() { return coachId; }
    public void setCoachId(Long coachId) { this.coachId = coachId; }

    public String getCoachName() { return coachName; }
    public void setCoachName(String coachName) { this.coachName = coachName; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
