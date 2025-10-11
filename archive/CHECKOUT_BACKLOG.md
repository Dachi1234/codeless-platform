# Checkout Backlog (Product & Architecture)

## Purpose
Enable users to purchase courses (single or bundles) securely and reliably, with clear UX and auditable, idempotent order processing.

## Glossary
- Order: Purchase record for one or more courses.
- OrderItem: A purchased course within an order.
- Payment Intent/Order: Provider-side payment attempt (e.g., PayPal Order).
- Idempotency Key: Client-provided key that guarantees exactly-once order creation.

## MVP Scope (V1)
- One-time purchases (single course; bundles optional if available).
- PayPal Checkout:
  - PayPal Wallet buttons (approve + capture).
  - Advanced Credit/Debit Cards via PayPal JS SDK (Hosted Fields).
- Server-created PayPal Order; client approval/confirmation via PayPal JS SDK.
- Transactional, idempotent checkout endpoint.
- Enrollment granted only on confirmed capture.
- Webhook to reconcile payment state (source of truth).
- Email receipt (basic) and success screen.
- Swagger docs for endpoints.

## Out of Scope (later phases)
- Subscriptions/memberships.
- Apple/Google Pay (unless provided by PayPal flow and enabled later).
- Split payments, installments.
- Invoicing/tax engine automation.

## User Stories (selected)
- As a guest, I can start checkout and be directed to login/register before pay.
- As an authenticated user, I can pay for a course and be enrolled automatically.
- As a user, I see a clear order summary and final price before paying.
- As a user, I receive a receipt and can view my orders later.
- As an admin, I can refund an order (manual V1), and the user loses access when fully refunded.

## Acceptance Criteria (MVP)
- Creating the same checkout twice with the same idempotency key does not duplicate orders or captures.
- An order transitions to PAID only when PayPal confirms capture succeeded (synchronous or webhook).
- Enrollment is created exactly once per paid item.
- Webhooks are authenticated and idempotent.
- All API responses use the unified error envelope.

## API Design (MVP)
- POST `/api/checkout`
  - Body: `{ items: [{ courseId: number }], idempotencyKey: string }`
  - Returns (PayPal): `{ orderId, provider: 'paypal', approveUrl?, clientToken?, amount, currency }`
    - Wallet: `approveUrl` (or SDK approval via `paypal.Buttons`).
    - Cards (Hosted Fields): `clientToken` for JS SDK.
- POST `/api/checkout/confirm`
  - Body: `{ orderId }` → server captures and returns order state snapshot
- GET `/api/orders` (mine)
  - Returns: paginated list of my orders (summary)
- GET `/api/orders/{id}` (mine)
  - Returns: order details with items and status
- POST `/api/orders/{id}/refund` (admin only, manual V1)

## Payment Provider (MVP)
- PayPal (Wallet + Advanced Cards)
  - Create Order (server) with amount/metadata
  - Client approves (wallet) or submits card (Hosted Fields)
  - Capture (server) and reconcile via webhook
  - Webhooks: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`

## Idempotency & Exactly-Once
- Client sends `Idempotency-Key` header and body field.
- Server stores key → order mapping; on repeat, returns same provider order.
- Database unique constraint on `(idempotency_key)` and `(order_number)`.
- Webhooks use provider event id with dedup store.

## Webhooks
- Endpoint: `/api/checkout/webhook/paypal`
- Verify signature with PayPal webhook credentials (transmission id, sig, cert url, auth algo).
- Idempotent handling with event id storage.
- Update order status; trigger enrollments on capture completed.

## Data Model (augment existing)
- `Order`: id, user_id, status (PENDING, REQUIRES_ACTION, PAID, FAILED, REFUNDED), currency, subtotal, discount, total, provider, provider_payment_id, idempotency_key, created_at, updated_at
- `OrderItem`: id, order_id, course_id, unit_price, quantity, line_total
- Indexes: `order(idempotency_key) unique`, `order(provider_payment_id) unique`, `order_item(order_id)`, `order_item(course_id)`

## State Machine
- PENDING → REQUIRES_ACTION (approval/3DS) → PAID → REFUNDED
- PENDING → FAILED

## Error Handling
- 400 for invalid items; 401/403 for auth; 409 for duplicate idempotency key on conflicting payload; 422 for provider failures; all with unified error envelope.

## Security & Compliance
- No raw card data on server; use PayPal Hosted Fields for cards.
- Secrets in env; rotate regularly.
- Least-privilege API keys; separate webhook secret.
- GDPR: minimal PII storage; data retention policy.

## Non-Functional Requirements
- Idempotent API (client + webhook); retry-safe.
- 99.9% availability goal.
- Observability: structured logs with order/payment ids, metrics for success/fail rates, webhook latency.
- Performance: checkout POST p95 < 400ms excluding external confirmation.

## Observability & Ops
- Actuator health for DB and PayPal reachability (probe).
- Dashboard: orders per day, payment success rate, refund rate.
- Alerts on webhook failures and payment error spikes.

## Frontend Requirements
- Checkout page with order summary, tax/currency display.
- PayPal JS SDK:
  - Wallet: `paypal.Buttons` render, approve, and call server capture.
  - Cards: Hosted Fields for card entry + server tokenization/capture.
- Clear error/success states; spinner during confirmation.
- Post-success redirect to Thank You + auto-enroll and link to My Courses.

## Admin Needs (Phase 2)
- Orders list, filters by status/date.
- Order detail with items, timeline, refund action.

## Testing Plan
- Unit tests for amount calc and idempotency store.
- Integration tests (Testcontainers) simulating full flow.
- Webhook tests: signature verify, duplicate delivery.
- Frontend e2e: happy path and failure recovery.

## Rollout Plan
- Feature-flag the new checkout endpoint.
- Test in staging with sandbox keys; migrate gradually.
- Monitor metrics; open bug bash.

## Phased Roadmap
- V1 (MVP): PayPal (wallet + cards), idempotent, webhook, enrollments, receipts, orders API (mine).
- V1.1: Refunds (admin), order history UI, taxes/coupons basic.
- V2: Additional PSP (e.g., Adyen/Braintree), subscriptions, invoices, advanced taxes, dunning, coupons/discount engine, gift purchases.

## Open Questions
- Do we need coupons/discount codes in V1 or V1.1?
- Do we support bundles at checkout or precomputed prices only?
- Tax requirements by region? Need VAT/GST support?
