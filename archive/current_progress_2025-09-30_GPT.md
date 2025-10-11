## Current Progress — 2025-09-30

### What’s in place
- **Monorepo**: `frontend/` (Angular 19, standalone, SCSS) + `backend/` (Spring Boot 3, JDK 21, Maven).
- **Branding**: Palette applied (Coral #FD8D6E, Blue #5A8DEE, Off‑White #F9F9F9, Dark #2E2E2E). Header/footer, hero, CTAs updated.
- **Frontend**
  - App shell with nav icons, Login/Sign Up actions, footer.
  - Home page: Full‑width hero, stats, Featured Courses, Upcoming Live Courses.
  - Components: `CourseCardComponent`, `UpcomingCardComponent` (reusable).
  - Global tokens/utilities in `src/styles.scss` + responsive tweaks.
  - Dev proxy: `frontend/proxy.conf.json` → `/api` → `http://localhost:8080`.
- **Backend**
  - Spring Boot app, CORS, basic security disabled for MVP.
  - Domain: `Course` entity; `CourseRepository`.
  - API: `GET /api/courses`, `GET /api/courses/{id}`.
  - Health: `GET /health`.
- **Database**
  - PostgreSQL with Flyway migrations: baseline, `courses` table, seed data.
  - Connection: `jdbc:postgresql://localhost:5432/codeless_db` (user `codeless_user`).

### How to run locally
1) Backend
   - `cd backend/codeless-backend`
   - `mvn -q -DskipTests spring-boot:run`
   - Test: `http://localhost:8080/api/courses`
2) Frontend
   - `cd frontend`
   - `npx ng serve --proxy-config proxy.conf.json`
   - App: `http://localhost:4200/home`

### What’s next (skeleton-first)
1) UI polish to Figma parity (spacing/typography, exact breakpoints).
2) Mobile nav (hamburger + overlay).
3) Courses list page using `CourseCardComponent` with pagination UI.
4) Course details page styling; add image/gallery placeholder.
5) Replace placeholder gradients with real images when available.

Later (post-skeleton)
- DTOs/service layer, pagination/filter on `/api/courses`.
- Auth (JWT) + guarded routes; Checkout MVP.

Reference: Figma design used as guide — https://www.figma.com/make/HzRS3G9QWQlDBc0SmsHKVt/Course-Selling-Website?node-id=0-1&p=f&t=VxKVMDH6JyG6Z8nr-0&fullscreen=1


