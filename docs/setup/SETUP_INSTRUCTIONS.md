# 🚀 Setup Instructions - Codeless E-Learning Platform

This guide will help you set up the project on a new machine or after cloning from Git.

---

## 📋 Prerequisites

- **Java 21** or higher
- **Node.js 18+** and npm
- **PostgreSQL 15+**
- **PowerShell** (Windows) or Bash (Linux/Mac)

---

## 🔧 Initial Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd codeless-platform
```

### 2. Database Setup

Create the PostgreSQL database and user:

```sql
CREATE DATABASE codeless_db;
CREATE USER codeless_user WITH PASSWORD 'superuser';
GRANT ALL PRIVILEGES ON DATABASE codeless_db TO codeless_user;
```

**Note**: For production, use a strong password and update the environment variables accordingly.

---

## 🔐 Configure Secrets

### Frontend - TinyMCE API Key

1. **Get a free TinyMCE API key**:
   - Visit: https://www.tiny.cloud/auth/signup/
   - Sign up for a free account
   - Copy your API key

2. **Create environment files**:

```bash
cd frontend/src/environments

# Copy the template
cp environment.template.ts environment.ts
cp environment.template.ts environment.prod.ts
```

3. **Edit both files** and replace `YOUR_TINYMCE_API_KEY_HERE` with your actual key:

```typescript
// environment.ts
export const environment = {
  production: false,
  tinymceApiKey: 'your-actual-api-key-here'
};

// environment.prod.ts
export const environment = {
  production: true,
  tinymceApiKey: 'your-actual-api-key-here'
};
```

### Backend - Environment Variables (Optional for Production)

For **local development**, the defaults in `application.yml` work fine.

For **production**, set these environment variables:

```bash
# Database
export DB_URL=jdbc:postgresql://your-db-host:5432/your-db
export DB_USERNAME=your-db-user
export DB_PASSWORD=your-secure-password

# JWT Secret (generate with: openssl rand -base64 32)
export SECURITY_JWT_SECRET=your-generated-secret-here

# PayPal (get from https://developer.paypal.com)
export PAYPAL_MODE=sandbox  # or 'live' for production
export PAYPAL_CLIENT_ID=your-paypal-client-id
export PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

---

## 📦 Install Dependencies

### Backend

```bash
cd backend/codeless-backend
mvn clean install
```

### Frontend

```bash
cd frontend
npm install
```

---

## 🚀 Run the Application

### Option 1: Use PowerShell Scripts (Windows - Easiest)

```powershell
# Start both backend and frontend
.\start-all.ps1

# Stop everything
.\stop-all.ps1
```

### Option 2: Run Manually

**Backend** (in one terminal):
```bash
cd backend/codeless-backend
mvn spring-boot:run
# or
./mvnw spring-boot:run
```

**Frontend** (in another terminal):
```bash
cd frontend
npm start
# or
ng serve
```

### Option 3: Use Individual Scripts

```powershell
# Start backend only
.\start-backend.ps1

# Start frontend only
.\start-frontend.ps1
```

---

## 🌐 Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080
- **Swagger Docs**: http://localhost:8080/swagger-ui.html

---

## 👤 Default Admin Account

After first run, the database is seeded with:

- **Email**: admin@codeless.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change this password immediately in production!

---

## 🛠️ Development Workflow

### Backend Development

```bash
cd backend/codeless-backend
mvn spring-boot:run
```

The backend will auto-reload on code changes (thanks to Spring DevTools).

### Frontend Development

```bash
cd frontend
npm start
```

The frontend will auto-reload on code changes (Angular live reload).

### Database Migrations

Flyway migrations run automatically on startup. To add a new migration:

1. Create a new file: `backend/codeless-backend/src/main/resources/db/migration/V{next_version}__description.sql`
2. Write your SQL
3. Restart the backend

Example: `V10__add_new_feature.sql`

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend/codeless-backend
mvn test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🐛 Troubleshooting

### "Environment file not found" Error

**Solution**: Make sure you created the environment files from the template:

```bash
cd frontend/src/environments
cp environment.template.ts environment.ts
cp environment.template.ts environment.prod.ts
```

### "Connection refused" to PostgreSQL

**Solution**: 
1. Check PostgreSQL is running: `sudo service postgresql status` (Linux) or check Services (Windows)
2. Verify database exists: `psql -U codeless_user -d codeless_db`
3. Check credentials in `application.yml` or environment variables

### TinyMCE Editor Not Loading

**Solution**: Verify your API key is correct in `environment.ts` and `environment.prod.ts`

### Port 8080 Already in Use

**Solution**: Kill the process using port 8080:

**Windows**:
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
lsof -ti:8080 | xargs kill -9
```

---

## 📚 Additional Resources

- **Backend API Documentation**: http://localhost:8080/swagger-ui.html
- **Angular Docs**: https://angular.io/docs
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **TinyMCE Docs**: https://www.tiny.cloud/docs/

---

## ⚠️ Security Reminders

1. ✅ Never commit `environment.ts` or `environment.prod.ts` to Git
2. ✅ Use strong passwords in production
3. ✅ Generate a new JWT secret for production: `openssl rand -base64 32`
4. ✅ Use real PayPal credentials for production
5. ✅ Enable HTTPS in production

---

**Need Help?** Check `SECURITY_AUDIT_REPORT.md` for security details or `CURRENT_STATUS.md` for feature status.

