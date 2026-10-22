package com.naanmudhalvan.wecare.repository;

import com.naanmudhalvan.wecare.entity.CoachEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoachRepository extends JpaRepository<CoachEntity, Long> {
    Optional<CoachEntity> findByMobileNumber(String mobileNumber);
    List<CoachEntity> findBySpecialtyIgnoreCase(String specialty);
}
