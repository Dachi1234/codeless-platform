# 🏗️ Technical Architecture

**Last Updated**: October 10, 2025  
**Platform**: Codeless E-Learning Platform

---

## 📊 System Overview

### **Platform Type**
Full-stack Learning Management System (LMS) with e-commerce capabilities.

### **Core Technologies**
- **Frontend**: Angular 19 (Standalone components, Signals)
- **Backend**: Spring Boot 3.3.4 (Java 21)
- **Database**: PostgreSQL 16 (Neon managed)
- **Deployment**: Vercel (frontend) + Render (backend) + Neon (database)
- **Version Control**: GitHub
- **API Documentation**: Swagger/OpenAPI

---

## 🎨 Frontend Architecture (Angular 19)

### **Technology Stack**
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 19.x | Framework |
| TypeScript | 5.x | Language |
| RxJS | 7.x | Reactive programming |
| SCSS | - | Styling |
| Plyr | 3.x | Video player |
| TinyMCE | 6.x | Rich text editor |

### **Architecture Pattern**
- **Standalone Components** (no NgModules)
- **Signals** for reactive state management
- **Services** for business logic and API calls
- **Guards** for route protection
- **Interceptors** for HTTP middleware

### **Project Structure**
```
frontend/src/app/
├── components/          # Reusable components
│   ├── quiz-builder/
│   ├── quiz-taker/
│   ├── article-editor/
│   └── video-player/
├── pages/               # Route components
│   ├── home/
│   ├── courses/
│   ├── dashboard/
│   ├── course-learn/
│   └── admin/
├── services/            # Business logic & APIs
│   ├── auth.service.ts
│   ├── course.service.ts
│   ├── cart.service.ts
│   └── dashboard.service.ts
├── guards/              # Route protection
│   ├── auth.guard.ts
│   └── admin.guard.ts
├── interceptors/        # HTTP middleware
│   ├── auth.interceptor.ts
│   └── api-url.interceptor.ts
└── environments/        # Configuration
    ├── environment.ts
    └── environment.prod.ts
```

### **State Management**
- **Signals** for reactive local state
- **BehaviorSubject** for shared state
- **LocalStorage** for persistence (auth token, cart)

### **Routing**
- Lazy loading ready (all components standalone)
- Auth guards for protected routes
- Admin guards for admin-only routes

### **HTTP Communication**
- HttpClient for all API calls
- Interceptors for:
  - JWT token injection
  - API URL prefixing (dev vs prod)
  - Error handling

---

## ⚙️ Backend Architecture (Spring Boot 3)

### **Technology Stack**
| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.3.4 | Framework |
| Java | 21 | Language |
| Spring Data JPA | 3.3.x | ORM |
| PostgreSQL | 16 | Database |
| Flyway | 10.x | Migrations |
| JWT | 0.12.x | Authentication |
| PayPal SDK | 2.x | Payments |
| Swagger/OpenAPI | 2.x | API docs |

### **Architecture Pattern**
- **Layered Architecture**:
  1. **Controllers** (REST API endpoints)
  2. **Services** (Business logic)
  3. **Repositories** (Data access)
  4. **Entities** (Domain models)

### **Project Structure**
```
backend/src/main/java/com/codeless/backend/
├── config/              # Configuration
│   ├── SecurityConfig.java
│   ├── WebConfig.java
│   ├── PayPalConfig.java
│   └── OpenApiConfig.java
├── domain/              # Entities (20+ files)
│   ├── User.java
│   ├── Course.java
│   ├── Enrollment.java
│   ├── Quiz.java
│   └── ...
├── repository/          # Data access (18 files)
│   ├── UserRepository.java
│   ├── CourseRepository.java
│   └── ...
├── service/             # Business logic
│   ├── AuthService.java
│   ├── CurriculumService.java
│   └── ...
├── web/api/             # Controllers
│   ├── AuthController.java
│   ├── CoursesController.java
│   ├── QuizController.java
│   ├── UserController.java
│   └── admin/           # Admin endpoints
│       ├── AdminCoursesController.java
│       ├── AdminQuizController.java
│       └── ...
└── security/            # Security
    ├── JwtAuthFilter.java
    ├── JwtTokenProvider.java
    └── UserDetailsServiceImpl.java
```

### **Security**
- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: Role-based (USER, ADMIN)
- **Password**: BCrypt hashing
- **CORS**: Configurable via environment variables
- **HTTPS**: Enabled in production (Render)

### **API Design**
- **RESTful** endpoints
- **DTOs** for request/response (prevent lazy loading issues)
- **Pagination** for list endpoints
- **Filtering** via query parameters
- **Standardized** error responses

---

## 💾 Database Architecture (PostgreSQL)

### **Schema Overview**
- **20+ tables**
- **Normalized** to 3NF
- **Foreign keys** for referential integrity
- **Indexes** on frequently queried columns
- **Version control** via Flyway migrations

### **Key Tables**
| Table | Purpose | Relationships |
|-------|---------|---------------|
| `users` | User accounts | → `enrollments`, `orders`, `cart_items` |
| `courses` | Course catalog | → `enrollments`, `curriculum_sections` |
| `enrollments` | User-course enrollment | → `course_progress`, `lesson_progress` |
| `curriculum_sections` | Course sections | → `curriculum_lessons` |
| `curriculum_lessons` | Lessons (video/article/quiz) | → `lesson_progress`, `quizzes`, `articles` |
| `quizzes` | Quiz configurations | → `quiz_questions` |
| `quiz_questions` | Quiz questions | → `quiz_answer_options` |
| `orders` | Payment orders | → `order_items` |
| `course_progress` | Course-level progress | → `enrollments` |
| `lesson_progress` | Lesson-level progress | → `curriculum_lessons`, `users` |

### **Migrations**
- **17 migrations** (V1 to V17)
- **Flyway** for version control
- **Idempotent** SQL (IF NOT EXISTS)
- **Comments** for documentation

**Latest Migration (V17)**:
- Added `acceptable_answers` to `quiz_answer_options`
- Added `selected_option_ids` to `quiz_user_answers`

---

## 🚀 Deployment Architecture

### **Infrastructure**
```
User Browser
     ↓
Vercel CDN (Frontend)
     ↓ HTTPS
Render Docker Container (Backend)
     ↓ PostgreSQL Protocol
Neon Database (Cloud PostgreSQL)
```

### **Frontend Deployment (Vercel)**
- **Platform**: Vercel
- **Build**: Angular production build
- **Output**: Static files (`dist/frontend/browser`)
- **Domain**: https://codeless.digital
- **Auto-deploy**: On Git push to `main`
- **Environment Variables**:
  - `API_URL`: Backend URL (Render)

### **Backend Deployment (Render)**
- **Platform**: Render
- **Runtime**: Docker
- **Port**: Dynamic (`$PORT` from Render)
- **Domain**: https://codeless-platform.onrender.com
- **Auto-deploy**: On Git push to `main`
- **Environment Variables**:
  - `DB_URL`: Neon connection string
  - `DB_USERNAME`, `DB_PASSWORD`
  - `JWT_SECRET`
  - `CORS_ALLOWED_ORIGINS`
  - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`

### **Database Deployment (Neon)**
- **Platform**: Neon (Serverless PostgreSQL)
- **Version**: PostgreSQL 16
- **Connection**: SSL required
- **Pooling**: Built-in connection pooling
- **Backups**: Automatic daily backups

---

## 🔐 Security Architecture

### **Authentication Flow**
```
1. User login → POST /api/auth/login {email, password}
2. Backend validates credentials (BCrypt)
3. Generate JWT token (signed with secret)
4. Return token to frontend
5. Frontend stores in localStorage
6. All subsequent requests include: Authorization: Bearer <token>
7. Backend validates token on each request (JwtAuthFilter)
```

### **Authorization**
- **Roles**: `ROLE_USER`, `ROLE_ADMIN`
- **Guards**: Auth guard (any user), Admin guard (admin only)
- **Endpoints**: Public, authenticated, admin-only

### **Data Protection**
- **Passwords**: BCrypt hashed (strength 10)
- **JWT**: Signed with HS512 algorithm
- **SQL Injection**: Protected via JPA (parameterized queries)
- **XSS**: Angular sanitization
- **CSRF**: Not needed (stateless JWT)

---

## 📡 API Documentation (Swagger/OpenAPI)

### **Access**
- **Local**: http://localhost:8080/swagger-ui.html
- **Production**: https://codeless-platform.onrender.com/swagger-ui.html

### **Features**
- Interactive API testing
- JWT authentication support
- Request/response examples
- Schema documentation
- 19 tagged categories

---

## 🔄 Key Workflows

### **User Enrollment Flow**
```
1. Browse courses → GET /api/courses
2. View course detail → GET /api/courses/{id}
3. Add to cart → POST /api/cart {courseId}
4. Checkout → GET /api/cart
5. PayPal payment → POST /api/checkout/create-order
6. Payment capture → POST /api/checkout/capture
7. Auto-enrollment → Backend creates enrollment
8. Redirect to dashboard
```

### **Learning Flow**
```
1. Dashboard → GET /api/dashboard/courses (with progress)
2. Click "Continue Learning" → /courses/{id}/learn
3. Load curriculum → GET /api/courses/{id}/curriculum
4. Select lesson → Load content (video/article/quiz)
5. Complete lesson → POST /api/curriculum/lessons/{id}/complete
6. Progress updated → Backend recalculates course progress
7. Dashboard refreshes with new progress
```

### **Quiz Flow**
```
1. Student clicks quiz lesson
2. GET /api/quizzes/{id} → Get quiz (without correct answers)
3. POST /api/quizzes/start → Create attempt
4. Student answers questions
5. POST /api/quizzes/submit → Submit answers
6. Backend grades (auto for MC/TF/Fill-blank)
7. Return results with correct answers
8. Mark lesson complete if passed
```

---

## 📊 Performance Considerations

### **Frontend**
- ✅ Lazy loading (standalone components ready)
- ✅ OnPush change detection (where applicable)
- ✅ HTTP caching (BehaviorSubject for shared data)
- ✅ Image optimization (Cloudinary ready)
- ⚠️ Bundle size optimization (can improve)

### **Backend**
- ✅ Connection pooling (HikariCP)
- ✅ JPA fetch strategies (LAZY by default, EAGER where needed)
- ✅ DTO pattern (prevent N+1 queries)
- ✅ Indexed foreign keys
- ⚠️ Caching (not implemented - can add Redis)

### **Database**
- ✅ Indexes on foreign keys
- ✅ Neon connection pooling
- ✅ Optimized queries (JOINs instead of multiple calls)
- ⚠️ Read replicas (not needed yet)

---

## 🔮 Scalability Roadmap

### **Current Capacity**
- **Users**: 100-500 concurrent (Render free tier)
- **Database**: 0.5GB data (Neon free tier)
- **Storage**: Unlimited (Cloudinary ready)

### **Scaling Strategy**
1. **Phase 1** (0-1K users):
   - Current setup sufficient
   - Upgrade Render to paid tier if needed

2. **Phase 2** (1K-10K users):
   - Add Redis for caching
   - CDN for static assets (already on Vercel)
   - Database connection pooling tuning

3. **Phase 3** (10K+ users):
   - Kubernetes for backend (multi-instance)
   - Database read replicas
   - Message queue for async tasks (RabbitMQ/Kafka)

---

**🏗️ Architecture is production-ready and scalable!**

