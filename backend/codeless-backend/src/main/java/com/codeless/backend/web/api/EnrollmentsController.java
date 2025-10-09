package com.codeless.backend.web.api;

import com.codeless.backend.domain.Course;
import com.codeless.backend.domain.Enrollment;
import com.codeless.backend.domain.User;
import com.codeless.backend.repository.CourseRepository;
import com.codeless.backend.repository.EnrollmentRepository;
import com.codeless.backend.repository.UserRepository;
import com.codeless.backend.web.api.dto.EnrollmentDTO;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentsController {
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public EnrollmentsController(EnrollmentRepository enrollmentRepository, UserRepository userRepository, CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @GetMapping
    public ResponseEntity<List<EnrollmentDTO>> listMine(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<EnrollmentDTO> enrollments = enrollmentRepository.findByUser(user)
            .stream()
            .map(EnrollmentDTO::from)
            .collect(Collectors.toList());
        return ResponseEntity.ok(enrollments);
    }

    public record ExistsResponse(boolean exists) {}

    @GetMapping("/exists")
    public ResponseEntity<ExistsResponse> exists(Authentication auth, @RequestParam("courseId") Long courseId) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        boolean exists = enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId);
        return ResponseEntity.ok(new ExistsResponse(exists));
    }

    public record CreateEnrollmentRequest(Long courseId) {}

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(Authentication auth, @RequestBody CreateEnrollmentRequest req) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Course course = courseRepository.findById(req.courseId()).orElseThrow();
        
        // Check if already enrolled
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            return ResponseEntity.status(409)
                    .body(new ErrorResponse("You are already enrolled in this course"));
        }
        
        try {
            Enrollment e = new Enrollment();
            e.setUser(user);
            e.setCourse(course);
            Enrollment saved = enrollmentRepository.save(e);
            return ResponseEntity.created(URI.create("/api/enrollments/" + saved.getId()))
                    .body(new CreateEnrollmentResponse(saved.getId(), user.getId(), course.getId(), saved.getEnrolledAt()));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(409)
                    .body(new ErrorResponse("You are already enrolled in this course"));
        }
    }

    public record CreateEnrollmentResponse(Long id, Long userId, Long courseId, java.time.OffsetDateTime enrolledAt) {}
    public record ErrorResponse(String message) {}
}


