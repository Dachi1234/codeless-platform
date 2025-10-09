package com.codeless.backend.exception;

/**
 * Exception thrown when a request conflicts with existing state
 * Examples: duplicate resources, idempotency mismatches, already enrolled
 */
public class ConflictException extends RuntimeException {
    
    public ConflictException(String message) {
        super(message);
    }
}

