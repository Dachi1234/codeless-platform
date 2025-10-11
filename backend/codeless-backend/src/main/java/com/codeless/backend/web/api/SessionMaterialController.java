package com.codeless.backend.web.api;

import com.codeless.backend.domain.SessionMaterial;
import com.codeless.backend.domain.User;
import com.codeless.backend.service.SessionMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Session Materials", description = "Manage files/materials for live sessions")
@SecurityRequirement(name = "Bearer Authentication")
public class SessionMaterialController {

    private final SessionMaterialService materialService;

    /**
     * Get all materials for a session
     */
    @Operation(
        summary = "Get session materials",
        description = "Get all uploaded materials for a specific session"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Materials retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Session not found")
    })
    @GetMapping("/sessions/{sessionId}/materials")
    public ResponseEntity<List<SessionMaterial>> getSessionMaterials(@PathVariable Long sessionId) {
        List<SessionMaterial> materials = materialService.getMaterialsForSession(sessionId);
        return ResponseEntity.ok(materials);
    }

    /**
     * Upload material for a session (admin only)
     */
    @Operation(
        summary = "Upload session material",
        description = "Upload a file (PDF, Excel, image, etc.) for a session (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Material uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file or empty"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Session not found"),
        @ApiResponse(responseCode = "500", description = "Upload failed")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/sessions/{sessionId}/materials")
    public ResponseEntity<?> uploadMaterial(
        @PathVariable Long sessionId,
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal User currentUser
    ) {
        try {
            SessionMaterial material = materialService.uploadMaterial(sessionId, file, currentUser);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "material", material,
                "message", "Material uploaded successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to upload material: " + e.getMessage()
            ));
        }
    }

    /**
     * Delete a material (admin only)
     */
    @Operation(
        summary = "Delete session material",
        description = "Delete an uploaded material file (admin only)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Material deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized"),
        @ApiResponse(responseCode = "404", description = "Material not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/materials/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }
}

