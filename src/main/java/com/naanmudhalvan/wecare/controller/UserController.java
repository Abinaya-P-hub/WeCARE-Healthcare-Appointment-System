package com.naanmudhalvan.wecare.controller;

import com.naanmudhalvan.wecare.dto.BookingResponseDTO;
import com.naanmudhalvan.wecare.dto.LoginDTO;
import com.naanmudhalvan.wecare.dto.UserDTO;
import com.naanmudhalvan.wecare.service.BookingService;
import com.naanmudhalvan.wecare.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final BookingService bookingService;

    public UserController(UserService userService, BookingService bookingService) {
        this.userService = userService;
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody UserDTO userDTO) {
        Long userId = userService.registerUser(userDTO);
        return new ResponseEntity<>(
                Map.of("message", "User registered successfully", "userId", userId),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@Valid @RequestBody LoginDTO loginDTO) {
        boolean success = userService.loginUser(loginDTO);
        return ResponseEntity.ok(Map.of("message", "Login successful", "status", success));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserProfile(@PathVariable Long userId) {
        UserDTO user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getUserBookings(@PathVariable Long userId) {
        List<BookingResponseDTO> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }
}
