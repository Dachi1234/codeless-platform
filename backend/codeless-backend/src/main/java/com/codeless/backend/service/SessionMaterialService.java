package com.codeless.backend.service;

import com.codeless.backend.domain.LiveSession;
import com.codeless.backend.domain.SessionMaterial;
import com.codeless.backend.domain.User;
import com.codeless.backend.repository.LiveSessionRepository;
import com.codeless.backend.repository.SessionMaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionMaterialService {

    private final SessionMaterialRepository materialRepository;
    private final LiveSessionRepository sessionRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Get all materials for a session
     */
    public List<SessionMaterial> getMaterialsForSession(Long sessionId) {
        return materialRepository.findByLiveSessionIdOrderByUploadedAtDesc(sessionId);
    }

    /**
     * Upload material for a session
     */
    @Transactional
    public SessionMaterial uploadMaterial(Long sessionId, MultipartFile file, User uploadedBy) throws IOException {
        LiveSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String fileName = file.getOriginalFilename();
        String fileType = determineFileType(fileName);
        int fileSizeKb = (int) (file.getSize() / 1024);

        // Upload to Cloudinary (using document/raw resource type for non-images)
        String fileUrl = cloudinaryService.uploadCourseImage(file); // Reuse for now, can create uploadDocument later

        SessionMaterial material = new SessionMaterial();
        material.setLiveSession(session);
        material.setFileName(fileName);
        material.setFileUrl(fileUrl);
        material.setFileType(fileType);
        material.setFileSizeKb(fileSizeKb);
        material.setUploadedBy(uploadedBy);

        log.info("Uploading material {} for session {}", fileName, sessionId);
        return materialRepository.save(material);
    }

    /**
     * Delete a material
     */
    @Transactional
    public void deleteMaterial(Long id) {
        log.info("Deleting material {}", id);
        materialRepository.deleteById(id);
    }

    /**
     * Determine file type from extension
     */
    private String determineFileType(String fileName) {
        if (fileName == null) return "unknown";
        
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        
        return switch (extension) {
            case "pdf" -> "pdf";
            case "doc", "docx" -> "word";
            case "xls", "xlsx", "csv" -> "excel";
            case "ppt", "pptx" -> "powerpoint";
            case "jpg", "jpeg", "png", "gif", "svg" -> "image";
            case "html", "htm" -> "html";
            case "css" -> "css";
            case "js" -> "javascript";
            case "json" -> "json";
            case "xml" -> "xml";
            case "zip", "rar", "7z" -> "archive";
            case "txt" -> "text";
            default -> "other";
        };
    }
}

