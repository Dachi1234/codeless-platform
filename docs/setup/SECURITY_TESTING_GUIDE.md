# Security Testing Guide - Admin Role Enforcement

**Purpose**: Verify that admin endpoints are properly protected and regular users cannot access admin functionality.

---

## 🧪 Test Setup

### Prerequisites
1. Backend running on `http://localhost:8080`
2. Database with test users:
   - Regular user: `user@test.com` (password: `test123`)
   - Admin user: `admin@test.com` (password: `admin123`)

### Create Test Users

```sql
-- Create test users
INSERT INTO users (email, password_hash, full_name, enabled, created_at, updated_at)
VALUES 
  ('user@test.com', '$2a$10$...', 'Regular User', true, NOW(), NOW()),
  ('admin@test.com', '$2a$10$...', 'Admin User', true, NOW(), NOW());

-- Get user IDs
SELECT id, email FROM users WHERE email IN ('user@test.com', 'admin@test.com');

-- Grant ROLE_ADMIN to admin user (replace USER_ID with actual ID)
INSERT INTO user_roles (user_id, role_id)
VALUES (
  (SELECT id FROM users WHERE email = 'admin@test.com'),
  (SELECT id FROM roles WHERE name = 'ROLE_ADMIN')
);

-- Grant ROLE_USER to both (if not already granted)
INSERT INTO user_roles (user_id, role_id)
SELECT id, (SELECT id FROM roles WHERE name = 'ROLE_USER')
FROM users WHERE email IN ('user@test.com', 'admin@test.com')
ON CONFLICT DO NOTHING;
```

---

## 📝 Test Cases

### Test 1: Get JWT Tokens

#### Get Regular User Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "test123",
    "rememberMe": false
  }'
```

Save the token as `USER_TOKEN`.

#### Get Admin User Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "rememberMe": false
  }'
```

Save the token as `ADMIN_TOKEN`.

---

### Test 2: Verify User Roles via `/api/me`

#### Regular User
```bash
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Response**:
```json
{
  "email": "user@test.com",
  "fullName": "Regular User",
  "roles": ["ROLE_USER"]
}
```

#### Admin User
```bash
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response**:
```json
{
  "email": "admin@test.com",
  "fullName": "Admin User",
  "roles": ["ROLE_USER", "ROLE_ADMIN"]
}
```

---

### Test 3: Admin Dashboard Access

#### ❌ Regular User (Should Fail)
```bash
curl -X GET http://localhost:8080/api/admin/dashboard/stats \
  -H "Authorization: Bearer USER_TOKEN" \
  -i
```

**Expected**: `HTTP 403 Forbidden`

#### ✅ Admin User (Should Succeed)
```bash
curl -X GET http://localhost:8080/api/admin/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -i
```

**Expected**: `HTTP 200 OK` with dashboard statistics

---

### Test 4: Admin Course Management

#### ❌ Regular User Tries to Create Course
```bash
curl -X POST http://localhost:8080/api/admin/courses \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hacked Course",
    "slug": "hacked-course",
    "description": "Unauthorized course",
    "kind": "SELF_PACED",
    "level": "BEGINNER",
    "price": 99.99,
    "category": "Security",
    "published": true
  }' \
  -i
```

**Expected**: `HTTP 403 Forbidden`

#### ✅ Admin User Creates Course
```bash
curl -X POST http://localhost:8080/api/admin/courses \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Authorized Course",
    "slug": "authorized-course",
    "description": "Admin created course",
    "kind": "SELF_PACED",
    "level": "BEGINNER",
    "price": 99.99,
    "category": "Programming",
    "published": true
  }' \
  -i
```

**Expected**: `HTTP 200 OK` with created course

---

### Test 5: User Management

#### ❌ Regular User Tries to List All Users
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer USER_TOKEN" \
  -i
```

**Expected**: `HTTP 403 Forbidden`

#### ❌ Regular User Tries to Suspend a User
```bash
curl -X PATCH http://localhost:8080/api/admin/users/1/toggle-status \
  -H "Authorization: Bearer USER_TOKEN" \
  -i
```

**Expected**: `HTTP 403 Forbidden`

#### ✅ Admin User Lists All Users
```bash
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -i
```

**Expected**: `HTTP 200 OK` with user list

---

### Test 6: Order Management & Refunds

#### ❌ Regular User Tries to Refund Order
```bash
curl -X POST http://localhost:8080/api/admin/orders/1/refund \
  -H "Authorization: Bearer USER_TOKEN" \
  -i
```

**Expected**: `HTTP 403 Forbidden`

#### ✅ Admin User Refunds Order
```bash
curl -X POST http://localhost:8080/api/admin/orders/1/refund \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -i
```

**Expected**: `HTTP 200 OK` (or 404 if order doesn't exist)

---

### Test 7: Course Content Management

#### ❌ Regular User Tries to Create Section
```bash
curl -X POST http://localhost:8080/api/admin/courses/1/sections \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hacked Section",
    "description": "Unauthorized section",
    "sectionOrder": 1
  }' \
  -i
```

**Expected**: `HTTP 403 Forbidden`

#### ❌ Regular User Tries to Create Lesson
```bash
curl -X POST http://localhost:8080/api/admin/sections/1/lessons \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hacked Lesson",
    "lessonType": "ARTICLE",
    "lessonOrder": 1
  }' \
  -i
```

**Expected**: `HTTP 403 Forbidden`

---

### Test 8: Quiz Management

#### ❌ Regular User Tries to Create Quiz
```bash
curl -X POST http://localhost:8080/api/admin/quizzes \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": 1,
    "title": "Unauthorized Quiz",
    "passingScore": 70
  }' \
  -i
```

**Expected**: `HTTP 403 Forbidden`

#### ❌ Regular User Tries to Delete Quiz
```bash
curl -X DELETE http://localhost:8080/api/admin/quizzes/1 \
  -H "Authorization: Bearer USER_TOKEN" \
  -i
```

**Expected**: `HTTP 403 Forbidden`

---

### Test 9: Live Course Management

#### ❌ Regular User Tries to Create Live Session
```bash
curl -X POST http://localhost:8080/api/admin/courses/1/sessions \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Session",
    "startTime": "2025-10-23T10:00:00Z",
    "durationMinutes": 60
  }' \
  -i
```

**Expected**: `HTTP 403 Forbidden`

---

### Test 10: No Token (Unauthenticated)

```bash
curl -X GET http://localhost:8080/api/admin/dashboard/stats -i
```

**Expected**: `HTTP 401 Unauthorized`

---

### Test 11: Invalid/Expired Token

```bash
curl -X GET http://localhost:8080/api/admin/dashboard/stats \
  -H "Authorization: Bearer invalid.token.here" \
  -i
```

**Expected**: `HTTP 401 Unauthorized`

---

## 🎯 Success Criteria

All tests should pass with these results:

| Test | Regular User | Admin User | No Auth |
|------|--------------|------------|---------|
| `/api/me` | 200 (ROLE_USER) | 200 (ROLE_ADMIN) | 401 |
| Admin Dashboard | 403 | 200 | 401 |
| Create Course | 403 | 200 | 401 |
| List Users | 403 | 200 | 401 |
| Refund Order | 403 | 200 | 401 |
| Create Section | 403 | 200 | 401 |
| Create Lesson | 403 | 200 | 401 |
| Create Quiz | 403 | 200 | 401 |
| Create Session | 403 | 200 | 401 |

---

## 🔍 What to Check

### In Backend Logs

Look for these log messages:

```
✅ SUCCESS: "Authenticated user admin@test.com with roles: [ROLE_ADMIN]"
✅ SUCCESS: "Authenticated user user@test.com with roles: [ROLE_USER]"
❌ EXPECTED: "JWT parse/validation error: ..."
```

### Security Indicators

1. **403 Forbidden** = Authenticated but not authorized (correct!)
2. **401 Unauthorized** = Not authenticated (correct!)
3. **200 OK** = Authenticated and authorized (correct for admin!)

---

## 🐛 Troubleshooting

### If Regular User Gets 200 Instead of 403

❌ **Problem**: Security is not working!

**Check**:
1. Is `@EnableMethodSecurity` in SecurityConfig? (Should be there)
2. Are `@PreAuthorize` annotations on controllers? (Should be there)
3. Does SecurityConfig have `/api/admin/**` rule? (Should be there)
4. Are you using the correct token?

### If Admin User Gets 403

❌ **Problem**: Admin doesn't have proper role!

**Check**:
```sql
SELECT u.email, r.name 
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@test.com';
```

Should show `ROLE_ADMIN`.

### If Backend Logs Show Wrong Roles

❌ **Problem**: Database or JWT filter issue!

**Check**:
1. JwtAuthFilter is loading roles from database
2. User exists in database
3. user_roles table has correct mappings

---

## 📊 Automated Testing Script

Save this as `test-security.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:8080"

echo "=== Security Testing Script ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Login as regular user
echo "Getting regular user token..."
USER_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"test123"}')
USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.token')

# Login as admin
echo "Getting admin user token..."
ADMIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}')
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')

echo ""
echo "=== Test Results ==="
echo ""

# Test 1: Regular user tries admin endpoint
echo -n "Test 1: Regular user tries admin dashboard... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET $API_URL/api/admin/dashboard/stats \
  -H "Authorization: Bearer $USER_TOKEN")
if [ $STATUS -eq 403 ]; then
  echo -e "${GREEN}PASS${NC} (403 Forbidden)"
else
  echo -e "${RED}FAIL${NC} (Expected 403, got $STATUS)"
fi

# Test 2: Admin user accesses admin endpoint
echo -n "Test 2: Admin user accesses admin dashboard... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET $API_URL/api/admin/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN")
if [ $STATUS -eq 200 ]; then
  echo -e "${GREEN}PASS${NC} (200 OK)"
else
  echo -e "${RED}FAIL${NC} (Expected 200, got $STATUS)"
fi

# Test 3: No auth
echo -n "Test 3: Unauthenticated request... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET $API_URL/api/admin/dashboard/stats)
if [ $STATUS -eq 401 ]; then
  echo -e "${GREEN}PASS${NC} (401 Unauthorized)"
else
  echo -e "${RED}FAIL${NC} (Expected 401, got $STATUS)"
fi

echo ""
echo "=== Testing Complete ==="
```

Run with:
```bash
chmod +x test-security.sh
./test-security.sh
```

---

## ✅ Validation Checklist

- [ ] Regular user gets 403 for all `/api/admin/**` endpoints
- [ ] Admin user gets 200 for all `/api/admin/**` endpoints
- [ ] Unauthenticated requests get 401
- [ ] Invalid tokens get 401
- [ ] `/api/me` shows correct roles for each user
- [ ] Backend logs show correct authentication
- [ ] No SQL errors in logs
- [ ] No authorization bypass possible

---

**Testing Completed**: _______________  
**Tester**: _______________  
**All Tests Passed**: [ ] Yes [ ] No  
**Notes**: _______________

