package com.codeless.backend.service;

import com.codeless.backend.domain.Assignment;
import com.codeless.backend.domain.Submission;
import com.codeless.backend.domain.User;
import com.codeless.backend.repository.AssignmentRepository;
import com.codeless.backend.repository.SubmissionRepository;
import com.codeless.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Submit an assignment (student)
     */
    @Transactional
    public Submission submitAssignment(Long assignmentId, Long userId, MultipartFile file) throws IOException {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file size
        long fileSizeMb = file.getSize() / (1024 * 1024);
        if (fileSizeMb > assignment.getMaxFileSizeMb()) {
            throw new IllegalArgumentException(String.format(
                "File size (%d MB) exceeds maximum allowed (%d MB)", 
                fileSizeMb, assignment.getMaxFileSizeMb()
            ));
        }

        // Validate file type
        String fileName = file.getOriginalFilename();
        String extension = fileName != null && fileName.contains(".") 
            ? fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
            : "";

        if (assignment.getAllowedFileTypes() != null && !assignment.getAllowedFileTypes().isEmpty()) {
            String[] allowedTypes = assignment.getAllowedFileTypes().toLowerCase().split(",");
            boolean isAllowed = false;
            for (String type : allowedTypes) {
                if (extension.equals(type.trim())) {
                    isAllowed = true;
                    break;
                }
            }
            if (!isAllowed) {
                throw new IllegalArgumentException(String.format(
                    "File type .%s is not allowed. Allowed types: %s", 
                    extension, assignment.getAllowedFileTypes()
                ));
            }
        }

        // Upload file to Cloudinary
        String fileUrl = cloudinaryService.uploadCourseImage(file); // Reuse for now

        // Check if user already submitted (update if exists)
        Submission submission = submissionRepository.findByAssignmentIdAndUserId(assignmentId, userId)
            .orElse(new Submission());

        boolean isNewSubmission = submission.getId() == null;

        submission.setAssignment(assignment);
        submission.setUser(user);
        submission.setFileName(fileName);
        submission.setFileUrl(fileUrl);
        submission.setSubmittedAt(OffsetDateTime.now());

        // Calculate if late
        OffsetDateTime dueDate = assignment.getDueDate();
        OffsetDateTime submittedAt = submission.getSubmittedAt();

        if (submittedAt.isAfter(dueDate)) {
            submission.setIsLate(true);
            long daysLate = ChronoUnit.DAYS.between(dueDate, submittedAt);
            submission.setDaysLate((int) daysLate);
            log.warn("Submission for assignment {} is {} days late", assignmentId, daysLate);
        } else {
            submission.setIsLate(false);
            submission.setDaysLate(0);
        }

        log.info("{} submission for assignment {} by user {}", 
            isNewSubmission ? "Creating" : "Updating", assignmentId, userId);

        return submissionRepository.save(submission);
    }

    /**
     * Get a student's submission for an assignment
     */
    public Submission getMySubmission(Long assignmentId, Long userId) {
        return submissionRepository.findByAssignmentIdAndUserId(assignmentId, userId)
            .orElse(null);
    }

    /**
     * Get all submissions for an assignment (admin)
     */
    public List<Submission> getSubmissionsForAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentIdOrderBySubmittedAtDesc(assignmentId);
    }

    /**
     * Get all submissions for a course (admin)
     */
    public List<Submission> getSubmissionsForCourse(Long courseId) {
        return submissionRepository.findByCourseId(courseId);
    }

    /**
     * Grade a submission (admin)
     */
    @Transactional
    public Submission gradeSubmission(Long submissionId, Integer grade, String feedback, Long gradedByUserId) {
        Submission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        User gradedBy = userRepository.findById(gradedByUserId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + gradedByUserId));

        // Validate grade
        Integer maxGrade = submission.getAssignment().getMaxGrade();
        if (grade < 0 || grade > maxGrade) {
            throw new IllegalArgumentException(String.format(
                "Grade must be between 0 and %d", maxGrade
            ));
        }

        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submission.setGradedAt(OffsetDateTime.now());
        submission.setGradedBy(gradedBy);

        log.info("Grading submission {} with score {}/{}", submissionId, grade, maxGrade);
        return submissionRepository.save(submission);
    }

    /**
     * Delete a submission
     */
    @Transactional
    public void deleteSubmission(Long id) {
        log.info("Deleting submission {}", id);
        submissionRepository.deleteById(id);
    }

    /**
     * Get ungraded submissions (for admin dashboard)
     */
    public List<Submission> getUngradedSubmissions() {
        return submissionRepository.findUngradedSubmissions();
    }

    /**
     * Get late submissions (for admin dashboard)
     */
    public List<Submission> getLateSubmissions() {
        return submissionRepository.findByIsLateTrueOrderBySubmittedAtDesc();
    }

    /**
     * Check if a user has submitted an assignment
     */
    public boolean hasSubmitted(Long assignmentId, Long userId) {
        return submissionRepository.existsByAssignmentIdAndUserId(assignmentId, userId);
    }
}

