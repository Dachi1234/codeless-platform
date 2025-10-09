# Database Schema Reference - Codeless Platform

## Overview
PostgreSQL database: `codeless_db`  
Total Tables: 8  
Latest Migration: V5 (Precision fixes & indexes)

---

## Table Structure

### 1. **course** (Products/Catalog)
```sql
CREATE TABLE course (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    image_url VARCHAR(255),
    kind VARCHAR(20) NOT NULL, -- PRE_RECORDED, LIVE, BUNDLE
    created_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX ix_course_title ON course(lower(title));
CREATE INDEX ix_course_price ON course(price);
CREATE INDEX ix_course_kind ON course(kind);
```

**Current Data**: ~8 seeded courses from V2 migration

---

### 2. **users** (Authentication)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- BCrypt hashed
    full_name VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Notes**:
- Passwords hashed with BCrypt (via AuthService)
- Old insecure admin account removed in V5

---

### 3. **roles** (Authorization)
```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Seed data
INSERT INTO roles(name) VALUES ('ROLE_ADMIN'), ('ROLE_USER');
```

**Current Roles**:
- `ROLE_ADMIN` - Full system access
- `ROLE_USER` - Standard user (default)

---

### 4. **user_roles** (Many-to-Many)
```sql
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
```

---

### 5. **orders** (Checkout/Payments)
```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(40) NOT NULL DEFAULT 'PENDING', -- OrderStatus enum
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    provider VARCHAR(40) DEFAULT 'paypal', -- V4
    provider_payment_id VARCHAR(120), -- V4
    idempotency_key VARCHAR(120), -- V4
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0, -- V5: Fixed from 10,2
    discount NUMERIC(12,2) NOT NULL DEFAULT 0, -- V5: Fixed from 10,2
    total NUMERIC(12,2) NOT NULL DEFAULT 0, -- V5: Fixed from 10,2
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (V4 + V5)
CREATE UNIQUE INDEX ux_orders_idempotency_key ON orders(idempotency_key);
CREATE UNIQUE INDEX ux_orders_provider_payment_id ON orders(provider_payment_id);
CREATE INDEX idx_orders_user_id ON orders(user_id); -- V5
CREATE INDEX idx_orders_status ON orders(status); -- V5
CREATE INDEX idx_orders_created_at ON orders(created_at); -- V5
```

**OrderStatus Values** (Java enum):
- `PENDING` - Created, awaiting payment
- `REQUIRES_ACTION` - User action needed
- `PAID` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

---

### 6. **order_items** (Order Line Items)
```sql
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE RESTRICT,
    unit_price NUMERIC(12,2) NOT NULL, -- V5: Fixed from 10,2
    quantity INT NOT NULL DEFAULT 1,
    line_total NUMERIC(12,2) NOT NULL -- V5: Fixed from 10,2
);

-- Indexes (V5)
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_course_id ON order_items(course_id);
```

---

### 7. **enrollments** (Course Access)
```sql
CREATE TABLE enrollments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, course_id) -- Prevent duplicate enrollments
);

-- Indexes (V5)
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
```

**Automation**: Created automatically by `OrderService.markOrderAsPaidAndEnroll()` when order status → PAID

---

### 8. **flyway_schema_history** (System)
Flyway migration tracking - **DO NOT MODIFY MANUALLY**

---

## Entity Relationships

```
users
├── 1:N → orders
├── 1:N → enrollments
└── N:M → roles (via user_roles)

course
├── 1:N → order_items
└── 1:N → enrollments

orders
├── N:1 → users
└── 1:N → order_items
    └── N:1 → course
```

---

## Common Queries

### Check User Enrollments
```sql
SELECT u.email, c.title, e.enrolled_at
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN course c ON e.course_id = c.id
WHERE u.email = 'user@example.com';
```

### Check Order Status
```sql
SELECT o.id, o.status, o.total, u.email, o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.id = 123;
```

### List Order Items
```sql
SELECT oi.id, c.title, oi.unit_price, oi.quantity, oi.line_total
FROM order_items oi
JOIN course c ON oi.course_id = c.id
WHERE oi.order_id = 123;
```

### User's Complete Order History
```sql
SELECT 
    o.id as order_id,
    o.status,
    o.total,
    o.created_at,
    c.title as course_title,
    oi.unit_price
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON oi.order_id = o.id
JOIN course c ON oi.course_id = c.id
WHERE u.email = 'user@example.com'
ORDER BY o.created_at DESC;
```

### Check Idempotency Key
```sql
SELECT id, user_id, status, total, created_at
FROM orders
WHERE idempotency_key = 'your-key-here';
```

---

## Data Integrity Constraints

### Unique Constraints
- `users.email` - One account per email
- `roles.name` - Role names unique
- `enrollments(user_id, course_id)` - No duplicate enrollments
- `orders.idempotency_key` - Idempotent checkout
- `orders.provider_payment_id` - No duplicate PayPal payments

### Foreign Key Cascade Rules
- `orders.user_id` → CASCADE (delete user → delete orders)
- `order_items.order_id` → CASCADE (delete order → delete items)
- `order_items.course_id` → RESTRICT (can't delete course in orders)
- `enrollments.user_id` → CASCADE
- `enrollments.course_id` → CASCADE
- `user_roles.*` → CASCADE

---

## Accessing Database Locally

### Using pgAdmin
1. Host: `localhost`
2. Port: `5432`
3. Database: `codeless_db`
4. Username: (from `application.yml`)
5. Password: (from `application.yml`)

### Using psql Command Line
```bash
# Connect
psql -h localhost -U your_username -d codeless_db

# List tables
\dt

# Describe table
\d course

# Run query
SELECT * FROM course LIMIT 5;

# Exit
\q
```

### Using DBeaver/DataGrip
1. Create new PostgreSQL connection
2. Connection settings from `backend/codeless-backend/src/main/resources/application.yml`
3. Test connection
4. Browse tables

---

## Migration History

| Version | Description | Key Changes |
|---------|-------------|-------------|
| V0 | Baseline | Initial setup |
| V1 | Create course | Core catalog table |
| V2 | Seed courses | 8 sample courses |
| V3 | Auth & Orders | Users, roles, orders, enrollments |
| V4 | Checkout fields | Provider, payment ID, idempotency |
| V5 | Fix precision | 10,2→12,2, indexes, remove admin |

---

## Database Maintenance

### Backup
```bash
pg_dump -h localhost -U your_username codeless_db > backup.sql
```

### Restore
```bash
psql -h localhost -U your_username codeless_db < backup.sql
```

### Reset Flyway (If Needed - CAUTION)
```sql
-- Only if migration fails and you need to restart
DELETE FROM flyway_schema_history WHERE version = '5';
-- Then restart application
```

### Check Migration Status
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

---

## Performance Notes

### Indexed Columns (Fast Queries)
✅ All foreign keys indexed (V5)  
✅ `course.title` (case-insensitive)  
✅ `course.price`, `course.kind`  
✅ `orders.status`, `orders.created_at`  
✅ `orders.idempotency_key`, `orders.provider_payment_id` (unique)

### Query Optimization Tips
- Use `JOIN FETCH` in JPA for eager loading
- Filter by indexed columns (`user_id`, `status`, `kind`)
- Use `EXPLAIN ANALYZE` to check query plans
- Pagination is already optimized in `CoursesController`

---

## Troubleshooting

### "Relation does not exist"
- Check flyway_schema_history: `SELECT * FROM flyway_schema_history;`
- Ensure all migrations ran: Should have V0-V5

### "Numeric precision mismatch"
- V5 migration fixes this
- If migration failed, manually run V5 SQL

### "Duplicate key violation"
- Check unique constraints (email, idempotency_key)
- Idempotency working as expected

### "Permission denied"
- Check PostgreSQL user permissions
- Verify application.yml credentials

---

**Last Updated**: October 7, 2025  
**Schema Version**: V5  
**Status**: ✅ Production-Ready

