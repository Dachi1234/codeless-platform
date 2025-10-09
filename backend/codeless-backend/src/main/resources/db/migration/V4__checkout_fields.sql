ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS provider VARCHAR(40) DEFAULT 'paypal',
    ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(120),
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(120);

CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_idempotency_key ON orders(idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_provider_payment_id ON orders(provider_payment_id);

-- Helpful indexes for course filters
CREATE INDEX IF NOT EXISTS ix_course_title ON course(lower(title));
CREATE INDEX IF NOT EXISTS ix_course_price ON course(price);
CREATE INDEX IF NOT EXISTS ix_course_kind ON course(kind);
