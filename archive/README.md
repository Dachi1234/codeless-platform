# 🎓 Codeless E-Learning Platform

A modern full-stack e-learning platform built with Angular 19 and Spring Boot.

---

## 🚀 Quick Start

### Prerequisites
- **Java 21** or higher
- **Node.js 18+** and npm
- **PostgreSQL 15+**
- **PowerShell** (Windows)

### Setup Database
```sql
CREATE DATABASE codeless_db;
CREATE USER codeless_user WITH PASSWORD 'superuser';
GRANT ALL PRIVILEGES ON DATABASE codeless_db TO codeless_user;
```

### Start Everything (Easiest Way)
```powershell
# Start both backend and frontend in separate windows
.\start-all.ps1

# Stop everything when done
.\stop-all.ps1
```

### Or Start Individually
```powershell
# Backend only
.\start-backend.ps1

# Frontend only
.\start-frontend.ps1
```

---

## 📋 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:4200 | Angular web app |
| **Backend** | http://localhost:8080 | Spring Boot API |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | API Documentation |
| **Health Check** | http://localhost:8080/health | Backend health status |

---

## 👤 Test Accounts

### Regular User
- **Email**: `user@example.com`
- **Password**: `password`

### Admin User
- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## 🛠️ Manual Setup (Alternative)

### Backend
```bash
cd backend/codeless-backend
./mvnw.cmd spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory (optional):

```env
# Database
DB_USERNAME=codeless_user
DB_PASSWORD=superuser

# JWT
SECURITY_JWT_SECRET=your_base64_secret_here
SECURITY_JWT_EXPIRATION_SECONDS=3600

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:4200

# PayPal (Optional - Demo mode works without these)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=your_webhook_id

# App
APP_URL=http://localhost:4200
```

---

## 📚 Features

### ✅ Completed
- User authentication (JWT)
- Course catalog with filtering & sorting
- Shopping cart
- Checkout & payments (Demo mode + PayPal ready)
- Dual payment methods (Credit/Debit Card + PayPal)
- Automatic enrollment after purchase
- My Courses page
- Dashboard with stats & achievements
- My Orders history
- Role-based access control (User/Admin)

### 🚧 In Progress
- Course content structure (sections, lessons)
- Video player with progress tracking
- Admin dashboard & management

### 📋 Planned
- Quizzes & assessments
- Coding exercises
- Certificates
- Live session management
- Email notifications
- Reviews & ratings
- And more! (See `MDs/COMPREHENSIVE_PRODUCT_BACKLOG.md`)

---

## 📖 Documentation

- **Comprehensive Backlog**: `MDs/COMPREHENSIVE_PRODUCT_BACKLOG.md`
- **Quick Start Guide**: `QUICK_START.md`
- **PayPal Setup**: `PAYPAL_SETUP_GUIDE.md`
- **Bug Fixes**: `BUGFIXES_2025_10_08.md`
- **Architecture**: `COURSE_CONTENT_ARCHITECTURE.md`

---

## 🏗️ Tech Stack

### Frontend
- Angular 19 (Standalone Components)
- TypeScript
- RxJS
- Signals (Reactive State)
- SCSS

### Backend
- Spring Boot 3.3.4
- Java 21
- PostgreSQL 15
- Flyway (Migrations)
- Spring Security + JWT
- PayPal Checkout SDK
- Swagger/OpenAPI

---

## 🗂️ Project Structure

```
codeless-platform/
├── backend/
│   └── codeless-backend/      # Spring Boot application
│       ├── src/main/java/
│       ├── src/main/resources/
│       └── pom.xml
├── frontend/                   # Angular application
│   ├── src/app/
│   ├── src/assets/
│   └── package.json
├── MDs/                        # Documentation
├── start-all.ps1              # Start both backend & frontend
├── start-backend.ps1          # Start backend only
├── start-frontend.ps1         # Start frontend only
├── stop-all.ps1               # Stop all services
└── README.md
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend/codeless-backend
./mvnw.cmd test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## 🔐 Security Notes

- JWT tokens stored in localStorage
- Passwords hashed with BCrypt
- CORS configured for development
- HTTPS required for production
- PayPal webhook signature verification (placeholder)

---

## 🚧 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Automatic (Angular dev server)
- **Backend**: Automatic (Spring Boot DevTools)

### Database Migrations
Flyway handles migrations automatically on startup. Migrations are in:
```
backend/codeless-backend/src/main/resources/db/migration/
```

### Clear Database (Reset)
```sql
DROP DATABASE codeless_db;
CREATE DATABASE codeless_db;
GRANT ALL PRIVILEGES ON DATABASE codeless_db TO codeless_user;
```
Then restart the backend to re-run migrations.

---

## 📊 Database Schema

The platform uses 12+ tables including:
- `users` - User accounts
- `user_roles` - Role assignments
- `course` - Course catalog
- `enrollment` - User course enrollments
- `cart` & `cart_items` - Shopping cart
- `orders` & `order_items` - Order management
- `course_progress` - Learning progress
- `achievements` - User achievements
- And more...

See migrations in `db/migration/` for full schema.

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📝 License

Proprietary - All rights reserved

---

## 🆘 Troubleshooting

### Backend won't start
```powershell
# Check if PostgreSQL is running
Test-NetConnection -ComputerName localhost -Port 5432

# Clean and rebuild
cd backend/codeless-backend
./mvnw.cmd clean install
```

### Frontend errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```powershell
# Find and kill process on port 8080 (backend)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Find and kill process on port 4200 (frontend)
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

---

## 📞 Support

For issues and questions, please check the documentation files in the `MDs/` folder.

---

**Built with ❤️ by the Codeless Team**

