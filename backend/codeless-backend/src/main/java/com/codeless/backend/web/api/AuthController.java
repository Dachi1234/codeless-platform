package com.codeless.backend.web.api;

import com.codeless.backend.service.AuthService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public record RegisterRequest(@Email String email, @NotBlank String password, String fullName) {}
    public record LoginRequest(@Email String email, @NotBlank String password, Boolean rememberMe) {}

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest body) {
        String jwt = authService.register(body.email(), body.password(), body.fullName());
        return ResponseEntity.ok(Map.of("token", jwt));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest body) {
        boolean rememberMe = body.rememberMe() != null && body.rememberMe();
        String jwt = authService.login(body.email(), body.password(), rememberMe);
        return ResponseEntity.ok(Map.of("token", jwt));
    }
}


