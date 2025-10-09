package com.codeless.backend.web.api.admin;

import com.codeless.backend.domain.User;
import com.codeless.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashSet;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Admin - Users", description = "Admin user management")
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsersController {

    private final UserRepository userRepository;

    @Data
    public static class AdminUserDTO {
        private Long id;
        private String email;
        private String fullName;
        private Set<String> roles;
        private String createdAt;
        private Boolean enabled;

        public static AdminUserDTO from(User user) {
            AdminUserDTO dto = new AdminUserDTO();
            dto.setId(user.getId());
            dto.setEmail(user.getEmail());
            dto.setFullName(user.getFullName());
            // Convert Set<Role> to Set<String>
            Set<String> roleNames = user.getRoles() != null 
                ? user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet())
                : new HashSet<>();
            dto.setRoles(roleNames);
            dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
            dto.setEnabled(user.getEnabled());
            return dto;
        }
    }

    @GetMapping
    public ResponseEntity<List<AdminUserDTO>> listUsers(@RequestParam(required = false) String q) {
        List<User> users = userRepository.findAllWithRoles();

        if (q != null && !q.isBlank()) {
            String lowerQ = q.toLowerCase();
            users = users.stream()
                    .filter(u -> u.getEmail().toLowerCase().contains(lowerQ) ||
                            (u.getFullName() != null && u.getFullName().toLowerCase().contains(lowerQ)))
                    .collect(Collectors.toList());
        }

        List<AdminUserDTO> result = users.stream()
                .map(AdminUserDTO::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/toggle-status")
    @Transactional
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setEnabled(!user.getEnabled());
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}

