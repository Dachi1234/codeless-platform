package com.codeless.backend.config;

import com.codeless.backend.domain.User;
import com.codeless.backend.repository.UserRepository;
import com.codeless.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger; 
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        log.debug("JwtAuthFilter invoked for {} {} - Authorization header present: {}", request.getMethod(), request.getRequestURI(), header != null);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                String email = jwtService.extractSubject(token);
                log.debug("Parsed JWT subject: {}", email);
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null && Boolean.TRUE.equals(user.getEnabled())) {
                        // Map user roles to Spring Security authorities
                        List<GrantedAuthority> authorities = user.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority(role.getName()))
                                .collect(Collectors.toList());
                        
                        UserDetails userDetails = org.springframework.security.core.userdetails.User
                                .withUsername(email)
                                .password(user.getPasswordHash())
                                .authorities(authorities)
                                .build();
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        log.debug("Authenticated user {} with roles: {}", email, authorities);
                    } else { log.debug("User not found or disabled for email: {}", email); }
                }
            } catch (Exception ex) {
                log.debug("JWT parse/validation error: {}", ex.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}


