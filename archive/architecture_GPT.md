# Codeless Web - Architecture

## Overview
Java (Spring Boot), Angular, PostgreSQL. Monorepo with `frontend` and `backend`.

## Stack
- Backend: Spring Boot 3 (Java 21), Web, Data JPA, Validation, Security, Flyway, Lombok, DevTools
- Frontend: Angular 19 (standalone components)
- Database: PostgreSQL 18

## Modules
- `backend/` Spring Boot app (API)
- `frontend/` Angular app (UI)

## Build & Run
- Backend (run from generated folder):
  - Windows PowerShell
    - `cd backend\codeless-backend`
    - `mvn spring-boot:run`
  - Alternative using wrapper (does not require global Maven):
    - `cd backend\codeless-backend`
    - `./mvnw.cmd spring-boot:run`
- Frontend:
  - `cd frontend`
  - `npm start`

## Environments
- Local: single PostgreSQL instance. Secrets to be managed via Spring `application.yaml` and Angular environment files.

## Security & CORS (planned)
- Enable CORS for the Angular dev origin.
- Basic Spring Security configuration; stateless API.

## API Surface (placeholders)
- GET `/api/courses`
- POST `/api/checkout` (placeholder)

## Data Model (placeholders)
- Course: `id`, `title`, `description`, `price`, `imageUrl`
- Order: `id`, `items`, `total`, `status`

## Next Steps
1. Configure DB connection in backend (`application.yaml`) for PostgreSQL.
2. Add Course entity/repository/controller.
3. Seed sample data via Flyway migrations.
4. Add CORS/Security basics.
5. Wire Angular `CourseService` and pages.

## MVP checklist
- Auth: register, login, minimal profile
- Catalog: home, list courses, course details
- Purchase: simple checkout (provider TBD), enrollment grant
- My Courses: list purchased items
- Live sessions: capacity/seat tracking (basic)
- Admin (minimal): manage courses and live sessions


### How to run locally
1) Backend
   - `cd backend\codeless-backend`
   - `mvn -q -DskipTests spring-boot:run`
   - Test: `http://localhost:8080/api/courses`

2) Frontend
   - `cd frontend`
   - `npx ng serve --proxy-config proxy.conf.json`
   - App: `http://localhost:4200/home`
