## Project: Codeless – Progress (2025-10-01)

### Backend – Current State
- Stack: Spring Boot 3.3.x, JDK 21, PostgreSQL, Flyway, Spring Data JPA, Spring Security (stateless JWT), Actuator, springdoc OpenAPI.
- Auth: Register/Login issue JWT; BCrypt hashing; `JwtAuthFilter` validates Bearer tokens.
- Identity: `GET /api/me` returns authenticated principal.
- Courses: `GET /api/courses` (paged) and `GET /api/courses/{id}` return `CourseDTO`.
- Enrollments: `GET /api/enrollments` (mine), `POST /api/enrollments` (create) with conflict handling.
- DB schema (Flyway): `course`, `users`, `roles`, `user_roles`, `orders`, `order_items`, `enrollments`; money columns numeric(12,2).
- Observability: Swagger UI enabled (`/swagger-ui/index.html`), OpenAPI (`/v3/api-docs`), security DEBUG logging enabled for troubleshooting.

### Frontend – Current State
- Angular app with Home, Courses, Course Detail pages; CourseService; dev proxy to backend; global styling and components (course card, upcoming card).
- Mobile nav and responsive layouts implemented; design aligned to Figma branding.

### Architecture Notes
- Stateless security; public endpoints: `/api/auth/**`, `/api/courses/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/health`/Actuator health.
- DTO boundary started (CourseDTO); global exception handler provides consistent error envelope.
- Entities use BigDecimal for monetary values; singular table name `course` respected in FKs.

### Gaps / Improvements (Architectural)
- Complete DTO coverage (Auth responses, Enrollment, Order, Checkout) and remove entity exposure from controllers.
- Bean Validation on all inputs; unify error schema (Problem+JSON or compact JSON envelope) and map 400/404/409 consistently.
- Catalog filtering with JPA Specifications: `q`, `kind`, `minPrice`, `maxPrice`, sort.
- Checkout/order flow: transactional, idempotent endpoint; order status model (PENDING/PAID/CANCELLED).
- Profiles (`dev`, `prod`), secrets management, Docker Compose (Postgres + backend), Maven wrapper & run scripts.
- Tests: unit, security, and Testcontainers integration tests; API smoke tests (RestAssured).
- Optional: refresh tokens, method-level security, metrics, structured JSON logs.

### Backlog – What’s Done
- Auth (register/login) + JWT filter; identity endpoint.
- Enrollments list/create with duplicate protection.
- Courses list/detail (paged) and DTOs.
- Flyway migrations and initial seed; Swagger UI; base global error handler.

### Backlog – Next High-Value Items
1) Checkout MVP
   - POST `/api/checkout` { courseIds: number[], idempotencyKey? }
   - Validations; compute totals; create `orders` + `order_items` + `enrollments` in one transaction; return OrderDTO.
   - GET `/api/orders` (mine) and GET `/api/orders/{id}` with items.
2) Courses filtering & sorting
   - Specifications for `q`, `kind`, `minPrice`, `maxPrice`, `sort`; document in OpenAPI.
3) DTO & error consistency
   - Typed request/response objects across controllers; standardized error payload; enrich OpenAPI with schemas/examples.
4) DevOps quality
   - `.mvn/wrapper`, one-click run scripts, `docker-compose.yml`, `application-dev.yml` seeding.
5) Security polish
   - `@PreAuthorize` on protected endpoints; optional refresh tokens; rate-limiting on auth endpoints.
6) Testing
   - Testcontainers integration tests for checkout and enrollments; RestAssured API smoke suite.

### Developer Shortcuts
- Run backend (dev):
  - From `backend/codeless-backend`: `mvn -q -DskipTests spring-boot:run`
- Swagger: `http://localhost:8080/swagger-ui/index.html`
- API base: `http://localhost:8080/api`

### Today’s Decision Log
- Upgraded to Spring Boot 3.3.x and updated JJWT (0.12.x), migrated JWT builder/parser API and key type to `SecretKey`.
- Fixed Flyway/table naming to `course`; ensured BigDecimal alignment with numeric columns.
- Enabled public access for Swagger UI; added security DEBUG logging for token parsing visibility.


