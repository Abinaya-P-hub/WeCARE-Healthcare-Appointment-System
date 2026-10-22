package com.naanmudhalvan.wecare.controller;

import com.naanmudhalvan.wecare.dto.BookingResponseDTO;
import com.naanmudhalvan.wecare.dto.CoachDTO;
import com.naanmudhalvan.wecare.dto.LoginDTO;
import com.naanmudhalvan.wecare.service.BookingService;
import com.naanmudhalvan.wecare.service.CoachService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coaches")
@CrossOrigin(origins = "*")
public class CoachController {

    private final CoachService coachService;
    private final BookingService bookingService;

    public CoachController(CoachService coachService, BookingService bookingService) {
        this.coachService = coachService;
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registerCoach(@Valid @RequestBody CoachDTO coachDTO) {
        Long coachId = coachService.registerCoach(coachDTO);
        return new ResponseEntity<>(
                Map.of("message", "Coach registered successfully", "coachId", coachId),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginCoach(@Valid @RequestBody LoginDTO loginDTO) {
        boolean success = coachService.loginCoach(loginDTO);
        return ResponseEntity.ok(Map.of("message", "Login successful", "status", success));
    }

    @GetMapping
    public ResponseEntity<List<CoachDTO>> getAllCoaches(@RequestParam(required = false) String specialty) {
        List<CoachDTO> coaches;
        if (specialty != null && !specialty.trim().isEmpty()) {
            coaches = coachService.getCoachesBySpecialty(specialty);
        } else {
            coaches = coachService.getAllCoaches();
        }
        return ResponseEntity.ok(coaches);
    }

    @GetMapping("/{coachId}")
    public ResponseEntity<CoachDTO> getCoachProfile(@PathVariable Long coachId) {
        CoachDTO coach = coachService.getCoachProfile(coachId);
        return ResponseEntity.ok(coach);
    }

    @GetMapping("/{coachId}/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getCoachBookings(@PathVariable Long coachId) {
        List<BookingResponseDTO> bookings = bookingService.getBookingsByCoachId(coachId);
        return ResponseEntity.ok(bookings);
    }
}
