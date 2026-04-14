package com.example.Complaint_Management.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhotoService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:demo}")
    private String cloudName;

    @Value("${app.upload.dir:./uploads/complaints}")
    private String localUploadDir;

    public UploadResult upload(MultipartFile file, String folder) {
        validateFile(file);

        // FALLBACK: If Cloudinary is not configured or set to demo, use local storage
        if (isCloudinaryNotConfigured()) {
            return uploadLocally(file, folder);
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "gramaniti/" + folder,
                            "resource_type", "image",
                            "quality", "auto",
                            "fetch_format", "auto"
                    )
            );

            return UploadResult.builder()
                    .url((String) result.get("secure_url"))
                    .publicId((String) result.get("public_id"))
                    .build();

        } catch (Exception e) {
            log.warn("Cloudinary upload failed, falling back to local: {}", e.getMessage());
            return uploadLocally(file, folder);
        }
    }

    private UploadResult uploadLocally(MultipartFile file, String folder) {
        try {
            // Create target dir if missing
            Path root = Paths.get(localUploadDir).toAbsolutePath().normalize();
            if (!Files.exists(root)) Files.createDirectories(root);

            String originalName = file.getOriginalFilename();
            String ext = originalName != null && originalName.contains(".") 
                    ? originalName.substring(originalName.lastIndexOf(".")) 
                    : ".jpg";
            
            String fileName = UUID.randomUUID().toString() + ext;
            Path targetPath = root.resolve(fileName);
            
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Saved photo locally at: {}", targetPath);
            
            // Generate valid frontend URL pointing back to our own API
            // Note: In production you'd use a full base URL from config
            String url = "/api/v1/complaints/public/photos/" + fileName;

            return UploadResult.builder()
                    .url(url)
                    .publicId("LOCAL") // For local deletion tracking
                    .build();

        } catch (IOException e) {
            log.error("Local photo upload failed", e);
            throw new RuntimeException("Photo storage failed: " + e.getMessage());
        }
    }

    private boolean isCloudinaryNotConfigured() {
        return cloudName == null || cloudName.isBlank() || 
               cloudName.equals("demo") || cloudName.equalsIgnoreCase("YOUR_CLOUD_NAME");
    }

    public void delete(String publicId) {
        if ("LOCAL".equals(publicId)) return; // Simple local cleanup logic could go here
        
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.warn("Could not delete photo from Cloudinary: {}", publicId);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        // 10MB limit
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 10MB");
        }
    }

    @Data
    @Builder
    public static class UploadResult {
        private String url;
        private String publicId;
    }
}
