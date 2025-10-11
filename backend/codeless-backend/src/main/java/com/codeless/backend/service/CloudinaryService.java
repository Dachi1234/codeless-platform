package com.codeless.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Service for uploading images to Cloudinary CDN.
 * Handles course images, user avatars, and other media files.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Uploads an image file to Cloudinary.
     * 
     * @param file The image file to upload (MultipartFile from Spring)
     * @param folder Optional folder name in Cloudinary (e.g., "courses", "avatars")
     * @return The secure URL of the uploaded image
     * @throws IOException if upload fails
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        log.info("Uploading image to Cloudinary - Folder: {}, Size: {} bytes", folder, file.getSize());

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image (got: " + contentType + ")");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : "";
        String publicId = folder + "/" + UUID.randomUUID().toString() + extension;

        try {
            // Upload to Cloudinary with transformation
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", publicId,
                "folder", folder,
                "resource_type", "image",
                "overwrite", false,
                "width", 1200,
                "height", 630,
                "crop", "limit", // Don't crop, just limit size
                "quality", "auto:good"
            ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new IOException("Image upload failed: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads a course image.
     */
    public String uploadCourseImage(MultipartFile file) throws IOException {
        return uploadImage(file, "courses");
    }

    /**
     * Uploads a user avatar.
     */
    public String uploadUserAvatar(MultipartFile file) throws IOException {
        return uploadImage(file, "avatars");
    }

    /**
     * Deletes an image from Cloudinary by its public ID.
     * 
     * @param publicId The public ID of the image (extracted from URL)
     * @return true if deletion was successful
     */
    public boolean deleteImage(String publicId) {
        try {
            log.info("Deleting image from Cloudinary: {}", publicId);
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String status = (String) result.get("result");
            boolean success = "ok".equals(status);
            
            if (success) {
                log.info("Image deleted successfully: {}", publicId);
            } else {
                log.warn("Image deletion returned status: {}", status);
            }
            
            return success;
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", publicId, e);
            return false;
        }
    }

    /**
     * Extracts the public ID from a Cloudinary URL.
     * Example: https://res.cloudinary.com/demo/image/upload/v1234/courses/abc.jpg
     * Returns: courses/abc
     */
    public String extractPublicId(String cloudinaryUrl) {
        if (cloudinaryUrl == null || !cloudinaryUrl.contains("cloudinary.com")) {
            return null;
        }

        try {
            // Extract public ID from URL
            String[] parts = cloudinaryUrl.split("/upload/");
            if (parts.length < 2) {
                return null;
            }

            String afterUpload = parts[1];
            // Remove version (v1234567890/)
            String withoutVersion = afterUpload.replaceFirst("v\\d+/", "");
            // Remove extension
            int lastDot = withoutVersion.lastIndexOf(".");
            if (lastDot > 0) {
                return withoutVersion.substring(0, lastDot);
            }

            return withoutVersion;
        } catch (Exception e) {
            log.error("Failed to extract public ID from URL: {}", cloudinaryUrl, e);
            return null;
        }
    }
}

