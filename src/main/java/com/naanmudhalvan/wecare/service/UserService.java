package com.naanmudhalvan.wecare.service;

import com.naanmudhalvan.wecare.dto.LoginDTO;
import com.naanmudhalvan.wecare.dto.UserDTO;

public interface UserService {
    Long registerUser(UserDTO userDTO);
    boolean loginUser(LoginDTO loginDTO);
    UserDTO getUserProfile(Long userId);
}
