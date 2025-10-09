package com.codeless.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationSeconds;
    private final long allowedClockSkewSeconds;

    public JwtService(
            @Value("${security.jwt.secret:ZmFrZS1kZXYtc2VjcmV0LXNob3VsZC1iZS1lbmNyeXB0ZWQ=}") String base64Secret,
            @Value("${security.jwt.expiration-seconds:3600}") long expirationSeconds,
            @Value("${security.jwt.clock-skew-seconds:30}") long allowedClockSkewSeconds
    ) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
        this.expirationSeconds = expirationSeconds;
        this.allowedClockSkewSeconds = allowedClockSkewSeconds;
    }

    public String generateToken(String subject, Map<String, Object> claims) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(subject)
                .claims(claims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(key)
                .compact();
    }

    public String extractSubject(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .clockSkewSeconds(allowedClockSkewSeconds)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}


