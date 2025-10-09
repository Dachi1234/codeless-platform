# 🚀 Codeless E-Learning Platform - Quick Start Guide

**Last Updated**: October 8, 2025

---

## ✅ What's Working Now

- ✅ User registration & login (JWT authentication)
- ✅ Course catalog with filtering & sorting
- ✅ Shopping cart
- ✅ Checkout & payments (PayPal demo mode)
- ✅ Automatic enrollment after purchase
- ✅ My Courses page
- ✅ Dashboard with stats
- ✅ My Orders page
- ✅ Role-based access control (User/Admin)

---

## 🏃 Quick Start (Development)

### 1. Start PostgreSQL

```powershell
# If using Docker
docker run --name codeless-postgres -e POSTGRES_DB=codeless_db -e POSTGRES_USER=codeless_user -e POSTGRES_PASSWORD=superuser -p 5432:5432 -d postgres:15

# Or use your local PostgreSQL installation
```

### 2. Start Backend

```powershell
cd backend/codeless-backend
./mvnw.cmd spring-boot:run
```

**Backend will run on**: http://localhost:8080  
**Swagger UI**: http://localhost:8080/swagger-ui.html

### 3. Start Frontend

```powershell
cd frontend
ng serve
```

**Frontend will run on**: http://localhost:4200

---

## 👤 Test Users

### User Account:
- **Email**: `user@example.com`
- **Password**: `password`
- **Role**: USER

### Admin Account:
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: ADMIN

---

## 🧪 Test the Complete Flow

### 1. Browse & Add to Cart
```
1. Open http://localhost:4200
2. Login as user@example.com
3. Go to "Courses"
4. Click on any course
5. Click "Add to Cart"
```

### 2. Checkout & Pay (Demo Mode)
```
6. Click cart icon in header
7. Review cart items
8. Click "Proceed to Checkout"
9. Click "Complete Order (Demo)"
10. Wait 2 seconds (simulated payment)
```

### 3. Verify Enrollment
```
11. Should redirect to "My Courses"
12. Course should appear in enrolled courses
13. Cart should be empty
```

### 4. Check Database
```sql
-- Check orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- Check enrollments
SELECT e.id, u.email, c.title, e.enrolled_at 
FROM enrollment e
JOIN users u ON e.user_id = u.id
JOIN course c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC
LIMIT 5;
```

---

## 📚 Important Files & Docs

### Documentation:
- `COMPREHENSIVE_PRODUCT_BACKLOG.md` - Full roadmap (60+ features)
- `CART_AND_PAYPAL_INTEGRATION_COMPLETE.md` - Recent changes
- `PAYPAL_SETUP_GUIDE.md` - PayPal integration guide
- `SESSION_SUMMARY_2025_10_08.md` - Today's work summary
- `COURSE_CONTENT_ARCHITECTURE.md` - Course content design

### Configuration:
- `backend/codeless-backend/src/main/resources/application.yml`
- `frontend/src/environments/`

### Database:
- Migrations: `backend/codeless-backend/src/main/resources/db/migration/`
- Schema: 7 migrations (V1-V7)

---

## 🔧 Environment Variables

### Backend (Optional - Has Defaults):

```env
# Database
DB_USERNAME=codeless_user
DB_PASSWORD=superuser

# JWT
SECURITY_JWT_SECRET=base64_encoded_secret
SECURITY_JWT_EXPIRATION_SECONDS=3600

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:4200

# PayPal (Optional - Demo mode works without these)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=

# App
APP_URL=http://localhost:4200
```

---

## 🎯 What to Do Next

### For Developers:

1. **Read**: `COMPREHENSIVE_PRODUCT_BACKLOG.md` for full roadmap
2. **Next Feature**: Course Content Structure (see backlog)
3. **Testing**: Add unit/integration tests
4. **PayPal**: Set up sandbox account (see `PAYPAL_SETUP_GUIDE.md`)

### For Product Owners:

1. **Review**: Backlog priorities
2. **Define**: Course content requirements
3. **Plan**: Admin panel features
4. **Decide**: Payment provider final choice

---

## 📊 API Endpoints (Swagger)

**Swagger UI**: http://localhost:8080/swagger-ui.html

### Key Endpoints:

**Auth**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

**Courses**:
- `GET /api/courses` - List courses (with filters)
- `GET /api/courses/{id}` - Course details

**Cart**:
- `GET /api/cart` - Get my cart
- `POST /api/cart/items` - Add item to cart
- `DELETE /api/cart/items/{courseId}` - Remove item
- `DELETE /api/cart` - Clear cart

**Checkout**:
- `POST /api/checkout` - Create order (idempotent)
- `POST /api/checkout/capture` - Capture payment

**Enrollments**:
- `GET /api/enrollments` - My enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/exists/{courseId}` - Check enrollment

**Dashboard**:
- `GET /api/dashboard` - Dashboard stats

**Orders**:
- `GET /api/orders` - My orders

---

## 🐛 Troubleshooting

### Backend won't start:
```
1. Check PostgreSQL is running
2. Verify database exists: codeless_db
3. Check credentials in application.yml
4. Run: ./mvnw.cmd clean install
```

### Frontend errors:
```
1. Run: npm install
2. Clear cache: npm cache clean --force
3. Delete node_modules and reinstall
4. Check Angular version: ng version
```

### Database errors:
```
1. Drop and recreate database
2. Restart backend (Flyway will migrate)
3. Check migration files in db/migration/
```

### Cart/Checkout not working:
```
1. Check browser console for errors
2. Verify JWT token in localStorage
3. Check backend logs
4. Test API with Postman/Swagger
```

---

## 📞 Support

- **Issues**: Check `SESSION_SUMMARY_*.md` files
- **API Docs**: http://localhost:8080/swagger-ui.html
- **Database**: Check Flyway migration files

---

## 🎉 You're All Set!

The platform is ready for testing in demo mode. Follow the test flow above to verify everything works!

**Happy Coding!** 🚀

