# 🚧 Placeholder Functionality List

This document tracks all **temporary/placeholder implementations** that need to be replaced with real functionality in production.

**Last Updated**: October 9, 2025, 00:30

---

## 💳 Payment Processing (DEMO MODE)

**File**: `backend/codeless-backend/src/main/java/com/codeless/backend/web/api/CheckoutController.java`

### What's Placeholder:
- ✅ **PayPal Order Creation** (Line ~55-73)
  - Generates fake order ID: `DEMO-ORDER-{id}-{timestamp}`
  - Skips real PayPal API call
  
- ✅ **PayPal Payment Capture** (Line ~99-114)
  - Generates fake capture ID: `DEMO-CAPTURE-{timestamp}`
  - Auto-approves all payments

### To Enable Real PayPal:
1. Get PayPal sandbox credentials from https://developer.paypal.com
2. Set environment variables:
   ```env
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_secret
   ```
3. Uncomment the `/* PRODUCTION */` code blocks
4. Remove demo mode code

**Impact**: Medium - Works for testing, no real money processing

---

## 🔐 Security

**File**: `backend/codeless-backend/src/main/java/com/codeless/backend/service/PayPalService.java`

### What's Placeholder:
- ⚠️ **Webhook Signature Verification** (Line ~130)
  - Currently returns `true` for all webhooks (INSECURE!)
  - Logs warning: "Webhook signature verification not yet implemented"

### To Fix:
- Implement PayPal webhook signature verification
- Reference: https://developer.paypal.com/api/rest/webhooks/rest/

**Impact**: HIGH - Security risk in production

---

## 📧 Email Notifications

**Status**: Not implemented

### What's Missing:
- Order confirmation emails
- Enrollment confirmation emails
- Password reset emails
- Live session reminders

### To Implement:
- Integrate email service (SendGrid/Mailgun/AWS SES)
- Create email templates
- Add event triggers

**Impact**: Medium - Users don't get notifications

---

## 🎨 Frontend Card Validation

**File**: `frontend/src/app/pages/checkout/checkout.component.ts`

### What's Placeholder:
- ❌ **Card Number Validation**
  - No Luhn algorithm check
  - Accepts any input
  
- ❌ **CVV Validation**
  - No length/format check
  
- ❌ **Expiry Date Validation**
  - No date validation
  - No format check (MM/YY)

### To Fix:
- Add card validation library
- Implement Luhn algorithm
- Add expiry date parsing

**Impact**: Low - Demo mode only

---

## 📊 Progress Tracking Placeholders (NEW)

**Files**: 
- `frontend/src/app/pages/dashboard/dashboard.component.ts`
- `frontend/src/app/pages/dashboard/dashboard.component.html`

### What's Placeholder:
- ✅ **Course Progress Display** (Line ~165-179 in HTML)
  - Shows "0/X lessons" for all courses
  - Progress bar always at 0%
  - "Not started yet" for all courses
  - Uses static enrollment date only

### Why It's Placeholder:
- No `lesson_progress` table implemented yet
- No actual lesson completion tracking
- Dashboard tabs filter (In Progress/Completed) don't work properly

### To Enable Real Progress Tracking:
1. Implement course content structure (sections, lessons)
2. Create `lesson_progress` table migration
3. Build lesson completion API endpoints
4. Update dashboard to fetch and calculate real progress percentages
5. Implement proper tab filtering based on actual completion data

**Impact**: MEDIUM - Dashboard shows placeholder data, but won't break functionality

---

## 🎓 Course Content Placeholders (NEW)

**Files**: Multiple frontend components

### What's Placeholder:
- ✅ **Instructor Avatars** (course-detail, course-card, dashboard)
  - Uses `ui-avatars.com` API for generated avatars
  - Falls back to initials-based avatars if no `instructorAvatarUrl`

### Why It's Placeholder:
- No actual instructor profile images uploaded
- No image storage system implemented

### To Enable Real Instructor Images:
1. Set up file upload service (S3, Cloudinary, etc.)
2. Add instructor profile management
3. Store real avatar URLs in database
4. Update seed data with actual image URLs

**Impact**: LOW - Functional placeholder that looks good

---

## 🎓 Learning Page Curriculum ~~(NEW)~~ ✅ **IMPLEMENTED**

**Files**: 
- `frontend/src/app/pages/course-learn/course-learn.component.ts`
- `backend/.../domain/CourseSection.java`, `Lesson.java`, `LessonProgress.java`
- `backend/.../api/CurriculumController.java`

### ✅ What's Now Real:
- ✅ **Database-driven curriculum** (course_sections, lessons tables)
- ✅ **Backend APIs** (`GET /api/courses/:id/curriculum`)
- ✅ **Progress tracking** saves to `lesson_progress` table
- ✅ **Completion tracking** with timestamps
- ✅ **3 seeded courses** with real content (Java, Marketing, Python)

### ⚠️ Still Placeholder:
- Video player (still shows purple gradient)
- Quizzes/exercises (no UI yet)
- Final exams

**Impact**: LOW - Core functionality complete, just needs video integration

---

## 🎬 Video Player ~~(NEW)~~ ✅ **IMPLEMENTED**

**Files**: 
- `frontend/src/app/components/video-player/video-player.component.ts`
- `frontend/src/app/pages/course-learn/course-learn.component.html`

### ✅ What's Now Real:
- ✅ **Plyr video player** integrated
- ✅ **YouTube embed** support
- ✅ **Vimeo embed** support
- ✅ **Direct video** support (MP4, etc.)
- ✅ **Playback position tracking** (saves every 10 seconds)
- ✅ **Auto-resume** from last watched position
- ✅ **Speed controls** (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- ✅ **Quality selection** (360p, 480p, 720p, 1080p)
- ✅ **Auto-advance** to next lesson when video ends
- ✅ **Auto-mark complete** when video finishes

### ⚠️ Still Needs:
- Video hosting/CDN (currently using YouTube embeds)
- Live streaming integration
- Video analytics (watch time, engagement)

**Impact**: LOW - Core functionality complete, works with YouTube/Vimeo

---

## 📅 Live Session Integration (NEW)

**Files**: 
- `frontend/src/app/pages/course-learn/course-learn.component.html`

### What's Placeholder:
- ✅ **Hardcoded Session Schedule** (Line ~102-130)
  - Shows 2 fake upcoming sessions
  - Static dates and times
  - "Join Session" button disabled
  - No Zoom/video conferencing integration

### Why It's Placeholder:
- No `live_sessions` table
- No Zoom/Google Meet API integration
- No calendar integration
- No email reminders

### To Enable Real Live Sessions:
1. Create `live_sessions` table with Zoom/Meet link storage
2. Integrate Zoom API or Google Meet API
3. Add session scheduling for instructors
4. Email reminders 24h and 15min before session
5. Auto-enable "Join" button 15min before start time

**Impact**: HIGH - Live courses non-functional

---

## 📝 Summary

| Feature | Status | Priority | Risk Level |
|---------|--------|----------|------------|
| PayPal Payment | 🟡 Demo Mode | Medium | Low |
| Webhook Verification | ⚠️ Insecure | HIGH | HIGH |
| Email Notifications | ❌ Not Impl | Medium | Medium |
| Card Validation | ❌ Not Impl | Low | Low |
| Course Progress Tracking | 🟡 Placeholder UI | Medium | Low |
| Instructor Avatars | 🟡 Generated | Low | Low |
| Course Curriculum | ✅ Implemented | - | - |
| Video Player | ✅ Implemented | - | - |
| Live Session Integration | ⚠️ Not Impl | HIGH | HIGH |
| Admin Curriculum Editor | 🚧 In Progress | HIGH | - |
| Admin Analytics Charts | 🟡 Placeholder | Medium | Low |
| Dashboard % Changes | 🟡 Hardcoded | Low | Low |

---

## 🎯 Next Steps for Production

### Critical (Do First)
1. **CRITICAL**: Implement webhook signature verification
2. **HIGH**: ✅ ~~Implement course content database~~ (DONE - sections, lessons tables exist)
3. **HIGH**: ✅ ~~Integrate video player~~ (DONE - Plyr integrated)
4. **HIGH**: 🚧 **IN PROGRESS**: Admin Curriculum Editor (UI for managing sections/lessons)
5. **HIGH**: Add live session integration (Zoom API)

### Medium Priority
6. **MEDIUM**: Set up real PayPal credentials
7. **MEDIUM**: Add email notification service
8. **MEDIUM**: ✅ ~~Implement real lesson progress tracking~~ (DONE - saves to DB)
9. **MEDIUM**: Add quizzes and exercises
10. **MEDIUM**: Add analytics charts (Chart.js integration)

### Low Priority
11. **LOW**: Add frontend card validation
12. **LOW**: Set up file storage for instructor avatars
13. **LOW**: Add video hosting/CDN (AWS S3, Vimeo)
14. **LOW**: Calculate real dashboard % changes

---

**Last Updated**: October 9, 2025, 00:30

