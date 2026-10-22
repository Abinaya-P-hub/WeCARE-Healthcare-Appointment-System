package com.naanmudhalvan.wecare.service;

import com.naanmudhalvan.wecare.dto.BookingDTO;
import com.naanmudhalvan.wecare.dto.BookingResponseDTO;

import java.util.List;

public interface BookingService {
    Long bookAppointment(BookingDTO bookingDTO);
    boolean rescheduleAppointment(Long bookingId, BookingDTO bookingDTO);
    boolean cancelAppointment(Long bookingId);
    BookingResponseDTO getBookingDetails(Long bookingId);
    List<BookingResponseDTO> getBookingsByUserId(Long userId);
    List<BookingResponseDTO> getBookingsByCoachId(Long coachId);
}
