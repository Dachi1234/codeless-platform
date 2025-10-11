package com.codeless.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Cloudinary image upload service.
 * Cloudinary is used for storing course images, user avatars, and other media files.
 */
@Configuration
@Slf4j
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:demo}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    /**
     * Creates and configures a Cloudinary instance.
     * 
     * Environment variables needed in production:
     * - CLOUDINARY_CLOUD_NAME
     * - CLOUDINARY_API_KEY
     * - CLOUDINARY_API_SECRET
     * 
     * For development, you can use the default "demo" cloud (limited functionality).
     */
    @Bean
    public Cloudinary cloudinary() {
        log.info("🔧 Initializing Cloudinary with cloud_name: {}", cloudName);
        log.info("🔧 API Key present: {}", apiKey != null && !apiKey.isEmpty() ? "YES" : "NO");
        log.info("🔧 API Secret present: {}", apiSecret != null && !apiSecret.isEmpty() ? "YES" : "NO");
        
        if (cloudName.equals("demo")) {
            log.warn("⚠️ Using default 'demo' Cloudinary cloud - limited functionality!");
        }
        
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }
}

