# Codeless – Product Backlog

## Vision
Codeless is a course platform focused initially on one flagship course: IT Project Management. The platform will support both pre‑recorded and live (scheduled) courses, bundles of complementary content, and will later expand to multiple courses.

## Scope assumptions
- Start with a single flagship course (IT Project Management) which includes complementary micro‑courses (bundle).
- Support two delivery types: pre‑recorded (on‑demand) and live cohorts (scheduled seats).
- Grow to many courses after MVP.
- Payments initially 1‑time purchase per course/bundle. Subscriptions later.

## Personas
- Visitor: anonymous user browsing the catalog.
- Student: registered user who can purchase and access courses.
- Instructor/Content Admin: internal role to manage courses, sessions, and enrollments (basic admin after MVP).
- System Admin: manages platform settings and users (internal).

## Releases (high‑level)
- MVP (v1.0): Auth, basic catalog, course details, checkout, enrollment, My Courses, live session seat cap, minimal admin surfaces.
- v1.1: Reviews/ratings, coupons, email notifications, search/filter, better UI/UX.
- v2+: OAuth login, subscriptions, bundles 2.0, waitlists and reminders, mobile enhancements.

## Epics and user stories

### Epic A: Authentication & Accounts
- A1. As a visitor, I can register with email and password.
  - Acceptance: Input validation, duplicate email handling, success email optional (later).
- A2. As a user, I can log in/out to access my profile and purchases.
  - Acceptance: Invalid credential feedback; session or token persisted.
- A3. As a user, I can reset my password via email link. (v1.1)
- A4. As a user, I can edit my profile (name, avatar optional). (v1.1)

### Epic B: Catalog & Course Model
- B1. As a visitor, I can view the Home page highlighting the flagship course.
- B2. As a visitor, I can view the Courses page with basic listing (title, type, price, rating placeholder).
- B3. As a visitor, I can open Course Details with syllabus, intro video, instructor bio, price, delivery type, and for live courses: next session dates and remaining seats.
- B4. As a product owner, I can model courses as:
  - PreRecordedCourse: has modules/lessons, content URLs.
  - LiveCourse: has one or more Sessions (start date/time, capacity, seats remaining).
  - CourseBundle: flagship course + complementary courses (purchased together).
- B5. As a visitor, I can see seat availability for a live session before buying.
- B6. Search/filter by type (pre‑recorded vs live) and price range. (v1.1)

### Epic C: Checkout & Payments
- C1. As a user, I can Buy Now from Course Details (skip cart for MVP).
  - Acceptance: Stripe test mode (or provider TBD), success/failure message.
- C2. As a user, I receive an order confirmation and an invoice/receipt. (v1.1)
- C3. Coupon codes and discounts. (v1.1)

### Epic D: Enrollment & Access
- D1. As a user, after purchase, my account is granted enrollment to the course (or bundle).
- D2. As a user, I can view My Courses and access purchased content.
- D3. For pre‑recorded courses, I can view a simple lesson list and play intro videos (MVP); full player later.
- D4. For live courses, I can select a cohort session; seats decrement on purchase, capped by capacity.
- D5. Waitlist for full sessions. (v1.1+)

### Epic E: Content Delivery
- E1. Store content references (video URLs) and serve via secure links (MVP: unlisted links or placeholder players).
- E2. Robust video hosting/DRM integration. (v2+)

### Epic F: Reviews & Ratings (v1.1)
- F1. As a student, I can rate a course and leave a review after completion.
- F2. As a visitor, I can see an aggregate rating and a few reviews on Course Details.

### Epic G: Notifications (v1.1)
- G1. Purchase success email, enrollment email.
- G2. Live session reminders (24h/2h before start), waitlist notifications.

### Epic H: Admin (Post‑MVP minimal)
- H1. Admin can CRUD courses (title, type, price, syllabus outline, intro video URL).
- H2. Admin can manage live course sessions (start time, capacity, seats, status).
- H3. Admin can view enrollments and orders.

### Epic I: Observability & Ops
- I1. Health checks and basic metrics.
- I2. Structured logging; request correlation IDs. (v1.1)
- I3. Config via environment variables and secrets.

### Epic J: Security & Compliance
- J1. Basic security hardening (headers, CSRF appropriately configured for API, input validation).
- J2. Privacy/GDPR basics (terms, privacy policy pages). (v1.1)

## Non‑functional requirements
- Performance: P95 API < 300ms for catalog reads; server can handle 100 RPS (MVP target).
- Availability: 99.9% target (non‑SLA in MVP).
- Security: OWASP Top 10 aware, secure password hashing, secrets not in code, CORS allowlist.
- Accessibility: WCAG AA aspirations for core flows.
- SEO: SSR or pre‑render later; MVP uses best practices (meta, sitemap later).
- Internationalization: English MVP; i18n later.

## Data model (draft)
- User(id, email, passwordHash, name, createdAt)
- Course(id, kind[PreRecorded|Live|Bundle], title, slug, description, price, imageUrl, introVideoUrl, ratingAggregate, createdAt)
- CourseBundle(id, courseId, childCourseId)
- Module(id, courseId, title, order)
- Lesson(id, moduleId, title, order, videoUrl, durationSec)
- Session(id, courseId, startAt, capacity, seatsRemaining, status)
- Order(id, userId, total, status, createdAt)
- OrderItem(id, orderId, courseId, sessionIdNullable, price)
- Enrollment(id, userId, courseId, sessionIdNullable, activatedAt)
- Review(id, courseId, userId, rating, comment, createdAt)

## Dependencies & integrations (initial)
- Payments: Stripe (test mode) for MVP.
- Email: transactional provider (later) or SMTP.
- Video: external hosting (YouTube unlisted/Vimeo) for MVP; proper hosting later.

## Acceptance criteria examples
- Auth: Given valid credentials, when I login, then I’m redirected to My Courses and see purchased items; invalid credentials show an error without revealing which field is wrong.
- Live seats: Given a session with capacity 20 and 19 enrollments, when one more purchase succeeds, seatsRemaining becomes 0 and further purchases are blocked or waitlisted.
- Checkout: Given a card in Stripe test mode, when payment succeeds, then an Order and Enrollment are created atomically; on failure, neither is created.

## Open questions
- Which payment provider(s) long‑term? Start with Stripe test mode.
- Refunds and cancellations policy?
- Content hosting preference for pre‑recorded videos?
- Do we support installment payments or only one‑time?
- Do instructors besides Codeless staff need their own portal (marketplace) later?

## MVP checklist (candidate)
- Register/Login, Profile minimal
- Home page (hero for IT Project Management bundle)
- Courses list + Course Details
- Buy Now (Stripe test) and enrollment grant
- My Courses
- Live session seat cap enforcement
- Minimal admin (endpoints or very simple UI) to manage courses and sessions
