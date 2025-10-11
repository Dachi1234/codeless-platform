package com.codeless.backend.web.api;

import com.codeless.backend.domain.User;
import com.codeless.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Manage user profile settings")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserRepository userRepository;

    @Operation(
            summary = "Update user profile",
            description = "Updates the current user's profile information (full name). Returns the updated user profile."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Profile updated successfully",
                    content = @Content(schema = @Schema(implementation = UserProfileDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        log.info("Updating profile for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update full name
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        // Save updated user
        User updatedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", email);

        return ResponseEntity.ok(UserProfileDTO.from(updatedUser));
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
    }

    @Data
    public static class UserProfileDTO {
        private Long id;
        private String email;
        private String fullName;

        public static UserProfileDTO from(User user) {
            UserProfileDTO dto = new UserProfileDTO();
            dto.setId(user.getId());
            dto.setEmail(user.getEmail());
            dto.setFullName(user.getFullName());
            return dto;
        }
    }
}

