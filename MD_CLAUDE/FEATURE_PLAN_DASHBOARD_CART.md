# Feature Plan: Dashboard, Cart & Orders - Architecture Design

**Date**: October 7, 2025  
**Scope**: Dashboard/Profile, Cart System, Enhanced Navigation, Orders Management  
**Approach**: Maintain architectural integrity, follow existing patterns

---

## 📋 Features to Implement (from Figma)

### 1. **Enhanced Navigation Menu**
- ✅ Home (exists)
- ✅ Courses (exists)
- 🆕 Dashboard (Profile page with stats, progress, achievements)
- 🆕 My Orders (Order history)
- 🆕 User name display next to logout
- 🆕 Cart icon with badge

### 2. **Dashboard/Profile Page**
- User profile card (avatar, name, email, edit button)
- Learning stats (Total Courses, Completed, Learning Time, Streak)
- Course progress cards with tabs (In Progress, Completed, All Courses)
- Completion rate visualization
- Achievements section
- Upcoming sessions section

### 3. **Cart & Checkout System**
- Add to Cart functionality (separate from Enroll Now)
- Cart page (review items, modify quantities, remove items)
- Checkout flow (cart → checkout → payment → confirmation)
- Order confirmation and history

---

## 🏗️ Architecture Analysis

### Current State:
✅ **Backend**:
- Auth system (JWT + RBAC)
- Courses API
- Enrollments API
- Orders API (idempotent checkout)
- User management

✅ **Frontend**:
- Auth pages (login, register)
- Course listing & detail
- Enrollment flow (direct enroll)
- Basic navigation

### Gap Analysis:

| Feature | Backend Status | Frontend Status | DB Status |
|---------|---------------|-----------------|-----------|
| User Profile Data | ✅ Partial (User entity) | ❌ Missing page | ⚠️ Needs stats tables |
| Learning Stats | ❌ Missing API | ❌ Missing | ⚠️ Need progress tracking |
| Achievements | ❌ Missing | ❌ Missing | ❌ Missing tables |
| Cart | ❌ Missing API | ❌ Missing | ❌ Missing cart table |
| Order History | ✅ API exists | ⚠️ Basic (My Courses) | ✅ Orders table exists |
| User Full Name | ✅ In User entity | ❌ Not displayed | ✅ Exists |

---

## 🗄️ Database Schema Changes

### 1. **Cart System (New Table)**

```sql
-- V6 Migration: Cart and Progress Tracking
CREATE TABLE IF NOT EXISTS cart (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, course_id) -- Prevent duplicate items
);

CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
```

**Why separate Cart table?**
- ✅ Persistent cart (survives logout)
- ✅ One cart per user
- ✅ Can be abandoned and recovered
- ✅ Separates shopping from purchasing

### 2. **Course Progress Tracking (New Table)**

```sql
CREATE TABLE IF NOT EXISTS course_progress (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_completed INT NOT NULL DEFAULT 0,
    lesson_total INT NOT NULL DEFAULT 0,
    time_spent_seconds BIGINT NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    completion_percentage INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(enrollment_id)
);

CREATE INDEX idx_course_progress_enrollment_id ON course_progress(enrollment_id);
```

**Why?**
- ✅ Track user progress per course
- ✅ Power dashboard stats
- ✅ Calculate completion rates
- ✅ Track learning time

### 3. **Achievements System (New Tables)**

```sql
CREATE TABLE IF NOT EXISTS achievements (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE, -- 'course_completer', 'week_streak', etc.
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50), -- For frontend icon mapping
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Seed achievements
INSERT INTO achievements (code, name, description, icon_name) VALUES
('course_completer', 'Course Completer', 'Complete your first course', 'trophy'),
('week_streak', 'Week Streak', 'Learn for 7 consecutive days', 'fire'),
('learning_enthusiast', 'Learning Enthusiast', 'Spend 10+ hours learning', 'star')
ON CONFLICT (code) DO NOTHING;
```

**Why?**
- ✅ Gamification for user engagement
- ✅ Shown on dashboard
- ✅ Extensible system

### 4. **Learning Streak Tracking (New Table)**

```sql
CREATE TABLE IF NOT EXISTS learning_streaks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak_days INT NOT NULL DEFAULT 0,
    longest_streak_days INT NOT NULL DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_learning_streaks_user_id ON learning_streaks(user_id);
```

**Why?**
- ✅ Track consecutive learning days
- ✅ Motivational metric for dashboard
- ✅ Auto-update on course access

---

## 🎨 Frontend Architecture

### New Components to Create:

#### 1. **Navigation Enhancement**
```typescript
// app.component.ts (update)
- Add cart badge (count from CartService)
- Display user.fullName next to logout
- Add Dashboard and My Orders menu items
```

#### 2. **Dashboard Page** (New)
```
/dashboard
├── ProfileCard (avatar, name, email, edit button)
├── StatsCards (total courses, completed, time, streak)
├── CourseProgressTabs (In Progress, Completed, All)
│   └── CourseProgressCard[] (with progress bars)
├── AchievementsSection
│   └── AchievementBadge[]
└── UpcomingSessionsSection
```

**Services Needed**:
- `DashboardService` - Aggregate stats
- `ProgressService` - Track course progress
- `AchievementService` - User achievements

#### 3. **Cart System** (New)
```
/cart
├── CartHeader (item count)
├── CartItemList
│   └── CartItem (course info, remove button)
├── CartSummary (subtotal, discount, total)
└── CheckoutButton (navigate to /checkout)
```

**Service**:
- `CartService` - Add/remove items, sync with backend

#### 4. **Checkout Enhancement** (Update existing)
```
/checkout
├── OrderSummary (from cart items)
├── PaymentForm (existing)
└── Complete Purchase button
```

**Flow**:
1. Add to Cart → Cart Page
2. Proceed to Checkout → Checkout Page (populate from cart)
3. Complete Purchase → Clear cart, create order, enroll

#### 5. **My Orders Page** (New)
```
/my-orders
├── OrderList
│   └── OrderCard (order ID, date, status, items, total)
│       └── OrderItem[] (course name, price)
```

---

## 🔄 Backend Architecture

### New APIs to Create:

#### 1. **Cart API**
```java
@RestController
@RequestMapping("/api/cart")
@SecurityRequirement(name = "bearerAuth")
public class CartController {
    
    @GetMapping // Get current user's cart
    ResponseEntity<CartDTO> getCart(Authentication auth);
    
    @PostMapping("/items") // Add item to cart
    ResponseEntity<CartDTO> addItem(@RequestBody AddCartItemRequest req, Authentication auth);
    
    @DeleteMapping("/items/{courseId}") // Remove item
    ResponseEntity<Void> removeItem(@PathVariable Long courseId, Authentication auth);
    
    @DeleteMapping // Clear cart
    ResponseEntity<Void> clearCart(Authentication auth);
}
```

#### 2. **Dashboard/Profile API**
```java
@RestController
@RequestMapping("/api/dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {
    
    @GetMapping("/stats") // Learning stats
    ResponseEntity<DashboardStatsDTO> getStats(Authentication auth);
    
    @GetMapping("/progress") // Course progress with tabs
    ResponseEntity<Page<CourseProgressDTO>> getProgress(
        @RequestParam(defaultValue = "ALL") ProgressFilter filter,
        Authentication auth
    );
    
    @GetMapping("/achievements") // User achievements
    ResponseEntity<List<AchievementDTO>> getAchievements(Authentication auth);
    
    @GetMapping("/upcoming-sessions") // Live course sessions
    ResponseEntity<List<UpcomingSessionDTO>> getUpcomingSessions(Authentication auth);
}
```

#### 3. **Progress Tracking API**
```java
@RestController
@RequestMapping("/api/progress")
@SecurityRequirement(name = "bearerAuth")
public class ProgressController {
    
    @PostMapping // Update progress (called when user watches lesson)
    ResponseEntity<CourseProgressDTO> updateProgress(
        @RequestBody UpdateProgressRequest req,
        Authentication auth
    );
    
    @GetMapping("/{enrollmentId}")
    ResponseEntity<CourseProgressDTO> getProgress(@PathVariable Long enrollmentId);
}
```

#### 4. **User Profile API** (New)
```java
@RestController
@RequestMapping("/api/profile")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {
    
    @GetMapping // Get full profile (extends /api/me)
    ResponseEntity<UserProfileDTO> getProfile(Authentication auth);
    
    @PutMapping // Update profile (name, avatar, etc.)
    ResponseEntity<UserProfileDTO> updateProfile(
        @RequestBody UpdateProfileRequest req,
        Authentication auth
    );
}
```

### New Services:

#### 1. **CartService**
```java
@Service
public class CartService {
    @Transactional
    Cart getOrCreateCart(User user);
    
    @Transactional
    Cart addItem(User user, Long courseId);
    
    @Transactional
    void removeItem(User user, Long courseId);
    
    @Transactional
    void clearCart(User user);
    
    // Business logic: prevent adding already enrolled courses
}
```

#### 2. **DashboardService**
```java
@Service
public class DashboardService {
    DashboardStatsDTO calculateStats(User user);
    // Aggregates: total courses, completed, learning time, streak
    
    Page<CourseProgressDTO> getCourseProgress(User user, ProgressFilter filter);
    
    List<AchievementDTO> getUserAchievements(User user);
}
```

#### 3. **ProgressService**
```java
@Service
public class ProgressService {
    @Transactional
    CourseProgress updateProgress(Enrollment enrollment, int lessonCompleted, int lessonTotal, long timeSpentSeconds);
    
    @Transactional
    void calculateCompletionPercentage(CourseProgress progress);
    
    // Auto-update streak on activity
    @Transactional
    void updateLearningStreak(User user);
}
```

#### 4. **AchievementService**
```java
@Service
public class AchievementService {
    @Transactional
    void checkAndAwardAchievements(User user);
    
    List<UserAchievement> getUserAchievements(User user);
}
```

---

## 🔗 Integration Points

### 1. **Cart → Checkout → Enrollment Flow**

```
User Journey:
1. Browse courses → Click "Add to Cart" → CartService.addItem()
2. View Cart → Click "Proceed to Checkout" → Navigate to /checkout
3. Checkout → Fill payment info → Click "Complete Purchase"
4. Backend:
   a. CheckoutService.createOrReuseOrder(from cart items)
   b. PayPal payment processing
   c. OrderService.markOrderAsPaidAndEnroll(orderId)
   d. CartService.clearCart(user)
5. Frontend: Redirect to /dashboard or /my-courses
```

### 2. **Direct Enroll Flow (Keep existing)**

```
User Journey:
1. Course Detail → Click "Enroll Now"
2. If free: EnrollmentService.enroll() → Redirect to My Courses
3. If paid: Navigate to /checkout (pre-fill with this course)
4. Continue existing checkout flow
```

**Both flows coexist**:
- ✅ Cart: For browsing multiple courses
- ✅ Direct Enroll: For single course purchase

### 3. **Dashboard Data Population**

```
On Dashboard Load:
1. GET /api/dashboard/stats → Display stat cards
2. GET /api/dashboard/progress?filter=IN_PROGRESS → Default tab
3. GET /api/dashboard/achievements → Show badges
4. GET /api/dashboard/upcoming-sessions → Show calendar

On Tab Switch:
- GET /api/dashboard/progress?filter=COMPLETED
- GET /api/dashboard/progress?filter=ALL
```

### 4. **Progress Tracking Integration**

```
When User Accesses Course:
1. Frontend: CoursePlayer component loaded
2. On lesson complete:
   - POST /api/progress { enrollmentId, lessonCompleted, timeSpent }
3. Backend:
   - ProgressService.updateProgress()
   - Update course_progress table
   - Update learning_streaks table
   - Check and award achievements
```

---

## 🎨 Frontend Component Structure

### Route Updates (`app.routes.ts`):
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
},
{
  path: 'my-orders',
  component: MyOrdersComponent,
  canActivate: [authGuard]
},
{
  path: 'cart',
  component: CartComponent
},
{
  path: 'checkout',
  component: CheckoutComponent, // Update existing
  canActivate: [authGuard]
}
```

### New Services:

#### `CartService`:
```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  cartCount = computed(() => this.cartItems().length);
  
  getCart(): Observable<Cart>;
  addItem(courseId: number): Observable<Cart>;
  removeItem(courseId: number): Observable<void>;
  clearCart(): Observable<void>;
}
```

#### `DashboardService`:
```typescript
@Injectable({ providedIn: 'root' })
export class DashboardService {
  getStats(): Observable<DashboardStats>;
  getProgress(filter: ProgressFilter): Observable<CourseProgress[]>;
  getAchievements(): Observable<Achievement[]>;
  getUpcomingSessions(): Observable<UpcomingSession[]>;
}
```

---

## 🎯 Implementation Priority

### Phase 1: Foundation (High Priority)
1. ✅ Backend: V6 migration (cart, progress, achievements tables)
2. ✅ Backend: Cart API + CartService
3. ✅ Backend: Dashboard API + DashboardService
4. ✅ Frontend: CartService + Cart page
5. ✅ Frontend: Update navigation (cart badge, user name, new menu items)

### Phase 2: Dashboard (High Priority)
6. ✅ Frontend: Dashboard page with stats cards
7. ✅ Frontend: Course progress tabs
8. ✅ Backend: Progress tracking API
9. ✅ Frontend: Achievements section

### Phase 3: Enhanced Checkout (Medium Priority)
10. ✅ Update checkout to support cart items
11. ✅ Cart → Checkout integration
12. ✅ Clear cart after successful order

### Phase 4: Orders & Profile (Medium Priority)
13. ✅ Frontend: My Orders page
14. ✅ Backend: Profile API
15. ✅ Frontend: Edit profile functionality

### Phase 5: Progress & Gamification (Low Priority - Future)
16. ⏳ Course player with progress tracking
17. ⏳ Auto-achievement awarding
18. ⏳ Streak calculation logic

---

## 🔒 Security Considerations

### Cart:
- ✅ One cart per user (enforce in service)
- ✅ Validate course exists before adding
- ✅ Prevent adding already-enrolled courses
- ✅ Cart operations require authentication

### Dashboard:
- ✅ Users can only see their own stats
- ✅ Achievements cannot be manually awarded via API
- ✅ Progress updates validated against enrollment

### Orders:
- ✅ Users can only view their own orders (existing)
- ✅ Order creation still idempotent

---

## 📐 Data Flow Diagrams

### Cart to Order Flow:
```
[Course Detail] → Add to Cart → [CartService] → POST /api/cart/items
                                                      ↓
[Cart Page] ← GET /api/cart ← [CartController] ← [Cart Table]
     ↓
Click Checkout
     ↓
[Checkout Page] ← Cart Items Passed
     ↓
Complete Purchase → POST /api/checkout (with cart items)
     ↓
[CheckoutService] → Create Order → [OrderService] → Mark Paid → Create Enrollments
     ↓
Clear Cart → DELETE /api/cart → [CartService.clearCart()]
```

### Dashboard Data Flow:
```
[Dashboard Component] → Load Stats → GET /api/dashboard/stats
                                         ↓
                              [DashboardService.calculateStats()]
                                         ↓
                    Aggregates: enrollments, course_progress, learning_streaks
                                         ↓
                              Returns: DashboardStatsDTO
```

---

## 🎨 Brand Style Application

### Colors (from existing design tokens):
```scss
// Primary
$primary-coral: #FF6B6B;
$primary-coral-light: #FF8E8E;

// Backgrounds
$bg-dark: #1A1A2E;
$bg-card: #16213E;

// Text
$text-primary: #FFFFFF;
$text-secondary: #94A3B8;

// Status colors
$success-green: #10B981;
$warning-orange: #F59E0B;
```

### Component Styling:
- ✅ Dashboard stat cards: `$bg-card` background, coral accents
- ✅ Progress bars: Coral gradient
- ✅ Achievement badges: Gold/coral/silver based on type
- ✅ Cart badge: Coral circle with white text
- ✅ Buttons: Coral primary, white text

---

## ✅ Architecture Integrity Checklist

- ✅ **Separation of Concerns**: Cart, Dashboard, Progress are separate services
- ✅ **Single Responsibility**: Each service handles one domain
- ✅ **DRY Principle**: Reuse existing Order/Enrollment logic
- ✅ **RESTful APIs**: Follow existing patterns
- ✅ **Transaction Management**: All mutations are @Transactional
- ✅ **Error Handling**: Use existing GlobalExceptionHandler
- ✅ **Security**: All new endpoints use @SecurityRequirement
- ✅ **Database Integrity**: Foreign keys, unique constraints, indexes
- ✅ **Frontend Patterns**: Use signals, services, standalone components
- ✅ **Type Safety**: DTOs for all API responses
- ✅ **Idempotency**: Cart operations are idempotent
- ✅ **Performance**: Indexed foreign keys, JOIN FETCH where needed

---

## 📊 Estimated Complexity

| Feature | Backend | Frontend | DB | Total |
|---------|---------|----------|-----|-------|
| Cart System | 4h | 6h | 1h | 11h |
| Dashboard | 6h | 10h | 2h | 18h |
| Progress Tracking | 4h | 4h | 1h | 9h |
| Achievements | 3h | 4h | 1h | 8h |
| My Orders Page | 1h | 4h | 0h | 5h |
| Profile Edit | 2h | 3h | 0h | 5h |
| **Total** | **20h** | **31h** | **5h** | **56h** |

---

## 🚀 Next Steps

1. **Review & Approve** this architecture plan
2. **Create V6 Migration** for new tables
3. **Implement Cart Backend** (API + Service)
4. **Implement Dashboard Backend** (API + Service)
5. **Create Frontend Components** (Cart, Dashboard, My Orders)
6. **Integrate Cart → Checkout Flow**
7. **Testing & Refinement**

---

**Status**: 📋 **PLAN READY FOR APPROVAL**  
**Maintains**: ✅ Existing architecture, patterns, and best practices  
**Adds**: 🆕 Cart, Dashboard, Progress Tracking, Achievements  
**Ready to implement**: ✅ All technical decisions made

