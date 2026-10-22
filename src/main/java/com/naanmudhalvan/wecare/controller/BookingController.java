package com.naanmudhalvan.wecare.controller;

import com.naanmudhalvan.wecare.dto.BookingDTO;
import com.naanmudhalvan.wecare.dto.BookingResponseDTO;
import com.naanmudhalvan.wecare.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> bookAppointment(@Valid @RequestBody BookingDTO bookingDTO) {
        Long bookingId = bookingService.bookAppointment(bookingDTO);
        return new ResponseEntity<>(
                Map.of("message", "Appointment booked successfully", "bookingId", bookingId),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<Map<String, Object>> rescheduleAppointment(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingDTO bookingDTO) {
        boolean success = bookingService.rescheduleAppointment(bookingId, bookingDTO);
        return ResponseEntity.ok(Map.of("message", "Appointment rescheduled successfully", "status", success));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Map<String, Object>> cancelAppointment(@PathVariable Long bookingId) {
        boolean success = bookingService.cancelAppointment(bookingId);
        return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully", "status", success));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getBookingDetails(@PathVariable Long bookingId) {
        BookingResponseDTO booking = bookingService.getBookingDetails(bookingId);
        return ResponseEntity.ok(booking);
    }
}
