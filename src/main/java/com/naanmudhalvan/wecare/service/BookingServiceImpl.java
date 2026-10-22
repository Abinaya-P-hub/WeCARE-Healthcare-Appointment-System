package com.naanmudhalvan.wecare.service;

import com.naanmudhalvan.wecare.dto.BookingDTO;
import com.naanmudhalvan.wecare.dto.BookingResponseDTO;
import com.naanmudhalvan.wecare.entity.BookingEntity;
import com.naanmudhalvan.wecare.entity.CoachEntity;
import com.naanmudhalvan.wecare.entity.UserEntity;
import com.naanmudhalvan.wecare.exception.BookingNotFoundException;
import com.naanmudhalvan.wecare.exception.CoachNotFoundException;
import com.naanmudhalvan.wecare.exception.UserNotFoundException;
import com.naanmudhalvan.wecare.exception.WeCareException;
import com.naanmudhalvan.wecare.repository.BookingRepository;
import com.naanmudhalvan.wecare.repository.CoachRepository;
import com.naanmudhalvan.wecare.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CoachRepository coachRepository;

    public BookingServiceImpl(BookingRepository bookingRepository, UserRepository userRepository, CoachRepository coachRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.coachRepository = coachRepository;
    }

    @Override
    public Long bookAppointment(BookingDTO bookingDTO) {
        // Validate user exists
        userRepository.findById(bookingDTO.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + bookingDTO.getUserId()));

        // Validate coach exists
        coachRepository.findById(bookingDTO.getCoachId())
                .orElseThrow(() -> new CoachNotFoundException("Coach not found with id: " + bookingDTO.getCoachId()));

        if (!bookingDTO.getAppointmentDate().isAfter(LocalDate.now())) {
            throw new WeCareException("Appointment date must be a future date");
        }

        // Check if coach already booked for same slot & date
        Optional<BookingEntity> existingBooking = bookingRepository
                .findByCoachIdAndAppointmentDateAndSlotAndStatusNot(
                        bookingDTO.getCoachId(),
                        bookingDTO.getAppointmentDate(),
                        bookingDTO.getSlot(),
                        "CANCELLED"
                );

        if (existingBooking.isPresent()) {
            throw new WeCareException("There is already an appointment booked for Coach on " 
                    + bookingDTO.getAppointmentDate() + " for slot: " + bookingDTO.getSlot());
        }

        BookingEntity booking = new BookingEntity(
                null,
                bookingDTO.getUserId(),
                bookingDTO.getCoachId(),
                bookingDTO.getAppointmentDate(),
                bookingDTO.getSlot(),
                "BOOKED"
        );

        BookingEntity saved = bookingRepository.save(booking);
        return saved.getBookingId();
    }

    @Override
    public boolean rescheduleAppointment(Long bookingId, BookingDTO bookingDTO) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new WeCareException("Cannot reschedule a cancelled appointment");
        }

        if (!bookingDTO.getAppointmentDate().isAfter(LocalDate.now())) {
            throw new WeCareException("Rescheduled date must be a future date");
        }

        // Check if coach is free on new slot & date
        Optional<BookingEntity> existing = bookingRepository
                .findByCoachIdAndAppointmentDateAndSlotAndStatusNot(
                        booking.getCoachId(),
                        bookingDTO.getAppointmentDate(),
                        bookingDTO.getSlot(),
                        "CANCELLED"
                );

        if (existing.isPresent() && !existing.get().getBookingId().equals(bookingId)) {
            throw new WeCareException("Slot " + bookingDTO.getSlot() + " on " + bookingDTO.getAppointmentDate() + " is already booked");
        }

        booking.setAppointmentDate(bookingDTO.getAppointmentDate());
        booking.setSlot(bookingDTO.getSlot());
        booking.setStatus("RESCHEDULED");
        bookingRepository.save(booking);
        return true;
    }

    @Override
    public boolean cancelAppointment(Long bookingId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new WeCareException("Appointment is already cancelled");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
        return true;
    }

    @Override
    public BookingResponseDTO getBookingDetails(Long bookingId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));

        return toResponseDTO(booking);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByUserId(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        return bookingRepository.findByUserId(userId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getBookingsByCoachId(Long coachId) {
        coachRepository.findById(coachId)
                .orElseThrow(() -> new CoachNotFoundException("Coach not found with id: " + coachId));

        return bookingRepository.findByCoachId(coachId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private BookingResponseDTO toResponseDTO(BookingEntity entity) {
        UserEntity user = userRepository.findById(entity.getUserId()).orElse(null);
        CoachEntity coach = coachRepository.findById(entity.getCoachId()).orElse(null);

        return new BookingResponseDTO(
                entity.getBookingId(),
                entity.getUserId(),
                user != null ? user.getName() : "Unknown",
                entity.getCoachId(),
                coach != null ? coach.getName() : "Unknown",
                coach != null ? coach.getSpecialty() : "Unknown",
                entity.getAppointmentDate(),
                entity.getSlot(),
                entity.getStatus()
        );
    }
}
