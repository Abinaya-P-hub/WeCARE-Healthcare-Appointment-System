package com.naanmudhalvan.wecare.service;

import com.naanmudhalvan.wecare.dto.LoginDTO;
import com.naanmudhalvan.wecare.dto.UserDTO;
import com.naanmudhalvan.wecare.entity.UserEntity;
import com.naanmudhalvan.wecare.exception.UserNotFoundException;
import com.naanmudhalvan.wecare.exception.WeCareException;
import com.naanmudhalvan.wecare.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Long registerUser(UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new WeCareException("User with email " + userDTO.getEmail() + " already exists");
        }
        if (userRepository.findByMobileNumber(userDTO.getMobileNumber()).isPresent()) {
            throw new WeCareException("User with mobile number " + userDTO.getMobileNumber() + " already exists");
        }

        UserEntity entity = new UserEntity(
                null,
                userDTO.getName(),
                userDTO.getPassword(),
                userDTO.getGender(),
                userDTO.getDateOfBirth(),
                userDTO.getMobileNumber(),
                userDTO.getEmail(),
                userDTO.getPincode(),
                userDTO.getCity(),
                userDTO.getState(),
                userDTO.getCountry()
        );

        UserEntity saved = userRepository.save(entity);
        return saved.getUserId();
    }

    @Override
    public boolean loginUser(LoginDTO loginDTO) {
        Optional<UserEntity> userOpt = Optional.empty();
        try {
            Long id = Long.parseLong(loginDTO.getId());
            userOpt = userRepository.findById(id);
        } catch (NumberFormatException ignored) {}

        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(loginDTO.getId());
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByMobileNumber(loginDTO.getId());
        }

        if (userOpt.isEmpty()) {
            throw new UserNotFoundException("User not found with identifier: " + loginDTO.getId());
        }

        UserEntity user = userOpt.get();
        if (!user.getPassword().equals(loginDTO.getPassword())) {
            throw new WeCareException("Invalid credentials for user");
        }
        return true;
    }

    @Override
    public UserDTO getUserProfile(Long userId) {
        UserEntity entity = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        UserDTO dto = new UserDTO();
        dto.setUserId(entity.getUserId());
        dto.setName(entity.getName());
        dto.setPassword("******");
        dto.setGender(entity.getGender());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setMobileNumber(entity.getMobileNumber());
        dto.setEmail(entity.getEmail());
        dto.setPincode(entity.getPincode());
        dto.setCity(entity.getCity());
        dto.setState(entity.getState());
        dto.setCountry(entity.getCountry());
        return dto;
    }
}
