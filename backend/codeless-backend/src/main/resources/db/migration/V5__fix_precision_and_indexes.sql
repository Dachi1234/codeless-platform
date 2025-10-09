-- Fix numeric precision mismatch between entity and database
-- Entities expect NUMERIC(12,2) but V3 created NUMERIC(10,2)
ALTER TABLE orders ALTER COLUMN subtotal TYPE NUMERIC(12,2);
ALTER TABLE orders ALTER COLUMN discount TYPE NUMERIC(12,2);
ALTER TABLE orders ALTER COLUMN total TYPE NUMERIC(12,2);
ALTER TABLE order_items ALTER COLUMN unit_price TYPE NUMERIC(12,2);
ALTER TABLE order_items ALTER COLUMN line_total TYPE NUMERIC(12,2);

-- Add performance indexes for foreign keys and common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course_id ON order_items(course_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

-- Remove insecure admin user with plain text password
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@codeless.local');
DELETE FROM users WHERE email = 'admin@codeless.local';

