package com.naanmudhalvan.wecare.service;

import com.naanmudhalvan.wecare.dto.CoachDTO;
import com.naanmudhalvan.wecare.dto.LoginDTO;

import java.util.List;

public interface CoachService {
    Long registerCoach(CoachDTO coachDTO);
    boolean loginCoach(LoginDTO loginDTO);
    CoachDTO getCoachProfile(Long coachId);
    List<CoachDTO> getAllCoaches();
    List<CoachDTO> getCoachesBySpecialty(String specialty);
}
