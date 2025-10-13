package com.codeless.backend.service;

import com.codeless.backend.domain.User;
import com.codeless.backend.exception.ConflictException;
import com.codeless.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public String register(String email, String rawPassword, String fullName) {
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("An account with this email already exists. Please try logging in or use a different email address.");
        }
        
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setFullName(fullName);
        userRepository.save(user);
        return jwtService.generateToken(email, Map.of("name", fullName));
    }

    public String login(String email, String rawPassword, boolean rememberMe) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return jwtService.generateToken(email, Map.of("name", user.getFullName()), rememberMe);
    }
}


