# Codeless – Dev Quickstart

## Prerequisites
- Java 21
- Maven 3.9+
- Node 20+ / npm 10+
- PostgreSQL (see backend/codeless-backend/src/main/resources/application.yml)

## Backend
- Start (Windows):
  - Default dev: `runbackend.bat`
  - Specific profile: `runbackend.bat prod`
- Env vars:
  - SECURITY_JWT_SECRET (Base64 256-bit key)
  - SECURITY_JWT_EXPIRATION_SECONDS (default 3600)
  - SECURITY_JWT_CLOCK_SKEW_SECONDS (default 30)
  - CORS_ALLOWED_ORIGINS (default http://localhost:4200)
  - DB_USERNAME, DB_PASSWORD
- Swagger: http://localhost:8080/swagger-ui/index.html

## Frontend
- From `frontend/`: `npm install && npm start`
- Dev proxy: `frontend/proxy.conf.json` -> backend 8080

## Notes
- Flyway migrations: backend/codeless-backend/src/main/resources/db/migration
- Money fields use BigDecimal aligned to DB numeric(10,2)
