# 🎓 Codeless E-Learning Platform

A full-stack e-learning platform built with **Angular 19** and **Spring Boot**, featuring courses, quizzes, video lessons, and progress tracking.

[![GitHub](https://img.shields.io/badge/GitHub-codeless--platform-blue?logo=github)](https://github.com/Dachi1234/codeless-platform)
[![Angular](https://img.shields.io/badge/Angular-19-red?logo=angular)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?logo=spring)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)

---

## 🌟 Features

### **For Students:**
- 🎥 **Video Lessons** - YouTube, Vimeo, and direct MP4 support with progress tracking
- 📄 **Article Lessons** - Rich text content with TinyMCE editor
- 🧩 **Interactive Quizzes** - Multiple choice, true/false, fill-in-blank, and short answer
- 📊 **Progress Tracking** - Track completion and time spent on each lesson
- 🎯 **Course Dashboard** - View enrolled courses and progress
- 🛒 **Shopping Cart** - Add courses and checkout
- 💳 **PayPal Integration** - Secure payment processing
- 🎓 **Certificates** - *(Coming Soon)*

### **For Instructors:**
- 📚 **Course Management** - Create and edit courses with 24+ fields
- 🗂️ **Curriculum Builder** - Organize lessons into sections
- ✏️ **Content Editors:**
  - Video player with URL support
  - Rich text article editor (TinyMCE)
  - **Quiz Builder** - Full quiz creation with 4 question types ✅ **NEW**
  - Exercise builder *(Coming Soon)*
- 📈 **Analytics** - *(Coming Soon)*
- 👥 **Student Management** - View enrollments and progress

### **For Admins:**
- 👤 **User Management** - Manage users and roles
- 📦 **Order Management** - View and manage orders
- 📊 **Enrollment Tracking** - Monitor course enrollments
- 🔐 **Role-Based Access Control** - Admin, Instructor, Student roles

---

## 🏗️ Architecture

### **Technology Stack:**

**Frontend:**
- Angular 19 (Standalone Components, Signals)
- TypeScript
- SCSS
- TinyMCE (Article Editor)
- Plyr (Video Player)

**Backend:**
- Spring Boot 3.2
- Java 21
- Spring Security (JWT Authentication)
- JPA/Hibernate
- PostgreSQL 16
- Flyway (Database Migrations)

**Payment:**
- PayPal REST API

**Deployment:**
- Frontend: Vercel
- Backend: Render.com
- Database: Neon/Supabase
- Media: Cloudinary

---

## 📦 Project Structure

```
codeless-platform/
├── frontend/                 # Angular 19 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Reusable components
│   │   │   ├── pages/        # Page components
│   │   │   ├── services/     # API services
│   │   │   ├── guards/       # Route guards
│   │   │   └── interceptors/ # HTTP interceptors
│   │   └── environments/     # Environment configs
│   └── package.json
│
├── backend/
│   └── codeless-backend/     # Spring Boot backend
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/codeless/backend/
│       │   │   │       ├── domain/        # JPA entities
│       │   │   │       ├── repository/    # JPA repositories
│       │   │   │       ├── web/api/       # REST controllers
│       │   │   │       ├── service/       # Business logic
│       │   │   │       └── config/        # Configuration
│       │   │   └── resources/
│       │   │       ├── db/migration/      # Flyway migrations
│       │   │       └── application.yml
│       │   └── test/
│       └── pom.xml
│
├── MDs/                      # Documentation
├── DEPLOYMENT_GUIDE.md       # Deployment instructions
├── CURRENT_STATUS.md         # Project status
└── README.md                 # This file
```

---

## 🚀 Getting Started

### **Prerequisites:**
- Node.js 18+
- Java 21+
- Maven 3.8+
- PostgreSQL 16+

### **1. Clone the Repository:**
```bash
git clone https://github.com/Dachi1234/codeless-platform.git
cd codeless-platform
```

### **2. Setup Database:**
```bash
# Create PostgreSQL database
createdb codeless_db

# Run migrations (handled automatically by Spring Boot on startup)
```

### **3. Backend Setup:**
```bash
cd backend/codeless-backend

# Copy environment template
cp env.template env.properties

# Edit env.properties with your database credentials
# DB_URL=jdbc:postgresql://localhost:5432/codeless_db
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run backend
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`

### **4. Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp src/environments/environment.template.ts src/environments/environment.ts

# Edit environment.ts with your TinyMCE API key

# Run frontend
ng serve --proxy-config proxy.conf.json
```

Frontend will start on `http://localhost:4200`

### **5. Access the Application:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/api

**Default Accounts:**
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `password`

---

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy to production (FREE)
- **[Current Status](CURRENT_STATUS.md)** - Feature implementation status
- **[Architecture](MDs/architecture_GPT.md)** - System architecture
- **[Quiz Builder Guide](QUIZ_BUILDER_COMPLETE.md)** - Quiz system documentation
- **[Security Audit](SECURITY_AUDIT_REPORT.md)** - Security review
- **[Setup Instructions](SETUP_INSTRUCTIONS.md)** - Developer setup

---

## 🎯 Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| **User Authentication** | ✅ Complete | JWT-based, Role-based access |
| **Course Management** | ✅ Complete | 24 fields, categories, pricing |
| **Video Lessons** | ✅ Complete | YouTube, Vimeo, MP4 with progress |
| **Article Lessons** | ✅ Complete | TinyMCE rich text editor |
| **Quiz Builder** | ✅ **NEW** | 4 question types, auto-grading |
| **Progress Tracking** | ✅ Complete | Lesson & course-level tracking |
| **Shopping Cart** | ✅ Complete | Add to cart, checkout |
| **PayPal Integration** | ✅ Complete | Sandbox mode (production ready) |
| **Admin Panel** | ✅ Complete | Users, courses, orders, curriculum |
| **Exercise Builder** | ⏳ Planned | Code challenges with test cases |
| **Certificates** | ⏳ Planned | PDF generation on completion |
| **Analytics Dashboard** | ⏳ Planned | Performance insights |

---

## 🧩 Quiz Builder (Latest Feature)

Complete quiz creation and taking system with:

**Admin Features:**
- Create quizzes with settings (time limit, passing score, attempts)
- 4 question types: Multiple Choice, True/False, Fill-in-Blank, Short Answer
- Add explanations and set points per question
- Visual question cards with correct answer highlighting

**Student Features:**
- Interactive quiz taking with timer
- Question navigation and progress tracking
- Instant auto-grading for objective questions
- Detailed results with explanations
- Retake functionality

**See:** [Quiz Builder Documentation](QUIZ_BUILDER_COMPLETE.md)

---

## 🔐 Security Features

- ✅ JWT Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ CORS Configuration
- ✅ SQL Injection Protection (JPA)
- ✅ XSS Protection (Angular Sanitization)
- ✅ HTTPS Ready
- ⚠️ See [PLACEHOLDER_FUNCTIONALITY.md](PLACEHOLDER_FUNCTIONALITY.md) for known temporary/insecure code

---

## 🛠️ Development

### **Branch Strategy:**
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches

### **Commit Convention:**
```
feat: Add quiz builder component
fix: Resolve login redirect issue
docs: Update deployment guide
style: Format code
refactor: Improve progress tracking
test: Add quiz service tests
```

### **Running Tests:**
```bash
# Backend tests
cd backend/codeless-backend
mvn test

# Frontend tests
cd frontend
ng test
```

---

## 📈 Roadmap

### **Q1 2025:**
- [x] Quiz Builder
- [ ] Exercise Builder
- [ ] Certificate Generation
- [ ] Video Upload (Direct Hosting)

### **Q2 2025:**
- [ ] Advanced Analytics
- [ ] Discussion Forums
- [ ] Live Classes (WebRTC)
- [ ] Mobile App (Ionic)

### **Q3 2025:**
- [ ] AI-Powered Recommendations
- [ ] Gamification (Badges, Leaderboards)
- [ ] Multi-language Support
- [ ] Accessibility (WCAG 2.1)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Dachi Peradze** - [@Dachi1234](https://github.com/Dachi1234)

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Spring Boot Team for the robust backend
- TinyMCE for the rich text editor
- Plyr for the video player
- All open-source contributors

---

## 📞 Contact & Support

- **GitHub Issues**: [Report a bug](https://github.com/Dachi1234/codeless-platform/issues)
- **Email**: dchh.peradze@gmail.com

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

**Built with ❤️ using Angular and Spring Boot**

