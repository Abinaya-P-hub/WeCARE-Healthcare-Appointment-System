package com.naanmudhalvan.wecare;

import com.naanmudhalvan.wecare.entity.CoachEntity;
import com.naanmudhalvan.wecare.entity.UserEntity;
import com.naanmudhalvan.wecare.repository.CoachRepository;
import com.naanmudhalvan.wecare.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CoachRepository coachRepository;

    public DataInitializer(UserRepository userRepository, CoachRepository coachRepository) {
        this.userRepository = userRepository;
        this.coachRepository = coachRepository;
    }

    @Override
    public void run(String... args) {
        if (coachRepository.count() == 0) {
            coachRepository.save(new CoachEntity(
                    null, "Dr. Priya Sharma", "Priya@123", "F",
                    LocalDate.of(1985, 4, 12), "9876543210", "Cardiology"
            ));
            coachRepository.save(new CoachEntity(
                    null, "Dr. Rajesh Kumar", "Rajesh@123", "M",
                    LocalDate.of(1988, 8, 20), "9876543211", "Physiotherapy"
            ));
            coachRepository.save(new CoachEntity(
                    null, "Dr. Ananya Reddy", "Ananya@123", "F",
                    LocalDate.of(1992, 11, 5), "9876543212", "Diet & Nutrition"
            ));
        }

        if (userRepository.count() == 0) {
            userRepository.save(new UserEntity(
                    null, "Rahul Verma", "Rahul@123", "M",
                    LocalDate.of(1998, 5, 15), "9123456780", "rahul.verma@example.com",
                    "600001", "Chennai", "Tamil Nadu", "India"
            ));
        }
    }
}
