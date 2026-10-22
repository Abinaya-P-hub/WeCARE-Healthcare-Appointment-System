package com.naanmudhalvan.wecare.service;

import com.naanmudhalvan.wecare.dto.CoachDTO;
import com.naanmudhalvan.wecare.dto.LoginDTO;
import com.naanmudhalvan.wecare.entity.CoachEntity;
import com.naanmudhalvan.wecare.exception.CoachNotFoundException;
import com.naanmudhalvan.wecare.exception.WeCareException;
import com.naanmudhalvan.wecare.repository.CoachRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CoachServiceImpl implements CoachService {

    private final CoachRepository coachRepository;

    public CoachServiceImpl(CoachRepository coachRepository) {
        this.coachRepository = coachRepository;
    }

    @Override
    public Long registerCoach(CoachDTO coachDTO) {
        if (coachRepository.findByMobileNumber(coachDTO.getMobileNumber()).isPresent()) {
            throw new WeCareException("Coach with mobile number " + coachDTO.getMobileNumber() + " already exists");
        }

        CoachEntity entity = new CoachEntity(
                null,
                coachDTO.getName(),
                coachDTO.getPassword(),
                coachDTO.getGender(),
                coachDTO.getDateOfBirth(),
                coachDTO.getMobileNumber(),
                coachDTO.getSpecialty()
        );

        CoachEntity saved = coachRepository.save(entity);
        return saved.getCoachId();
    }

    @Override
    public boolean loginCoach(LoginDTO loginDTO) {
        Optional<CoachEntity> coachOpt = Optional.empty();
        try {
            Long id = Long.parseLong(loginDTO.getId());
            coachOpt = coachRepository.findById(id);
        } catch (NumberFormatException ignored) {}

        if (coachOpt.isEmpty()) {
            coachOpt = coachRepository.findByMobileNumber(loginDTO.getId());
        }

        if (coachOpt.isEmpty()) {
            throw new CoachNotFoundException("Coach not found with identifier: " + loginDTO.getId());
        }

        CoachEntity coach = coachOpt.get();
        if (!coach.getPassword().equals(loginDTO.getPassword())) {
            throw new WeCareException("Invalid credentials for coach");
        }
        return true;
    }

    @Override
    public CoachDTO getCoachProfile(Long coachId) {
        CoachEntity entity = coachRepository.findById(coachId)
                .orElseThrow(() -> new CoachNotFoundException("Coach not found with id: " + coachId));

        return convertToDTO(entity);
    }

    @Override
    public List<CoachDTO> getAllCoaches() {
        return coachRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CoachDTO> getCoachesBySpecialty(String specialty) {
        return coachRepository.findBySpecialtyIgnoreCase(specialty).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CoachDTO convertToDTO(CoachEntity entity) {
        CoachDTO dto = new CoachDTO();
        dto.setCoachId(entity.getCoachId());
        dto.setName(entity.getName());
        dto.setPassword("******");
        dto.setGender(entity.getGender());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setMobileNumber(entity.getMobileNumber());
        dto.setSpecialty(entity.getSpecialty());
        return dto;
    }
}
