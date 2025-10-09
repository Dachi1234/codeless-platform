package com.codeless.backend.web.api;

import com.codeless.backend.domain.User;
import com.codeless.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MeController {
    
    private final UserRepository userRepository;
    
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Convert Set<Role> to Set<String> (role names only)
        Set<String> roleNames = user.getRoles() != null && !user.getRoles().isEmpty()
                ? user.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(Collectors.toSet())
                : Set.of("ROLE_USER");
        
        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("roles", roleNames);
        
        return ResponseEntity.ok(response);
    }
}


