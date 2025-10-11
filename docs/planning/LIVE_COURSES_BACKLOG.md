# 🎥 Live Courses - Product Backlog

**Created**: October 11, 2025  
**Status**: 📋 **PLANNING PHASE**  
**Priority**: 🔥 **HIGH** - Core differentiator feature  
**Estimated Effort**: 16-20 hours  

---

## 📖 **PRODUCT VISION**

### **What is a Live Course?**
A Live Course is a scheduled, instructor-led learning experience where students join real-time sessions via Zoom. Unlike self-paced courses (video/article/quiz), Live Courses have:
- **Fixed schedule** (start date, end date, session times)
- **Live interactive sessions** (Zoom meetings)
- **Limited capacity** (max students)
- **Shared materials** (files uploaded during/after sessions)
- **Live quizzes** (taken during sessions)
- **Student submissions** (homework, projects)
- **Session recordings** (for review after live)

### **User Types:**
1. **Admin/Instructor**: Creates course, schedules sessions, uploads materials, grades submissions
2. **Student**: Enrolls, attends sessions, takes quizzes, uploads work, reviews recordings

---

## 🎯 **USER STORIES**

### **Epic 1: Course Setup (Admin/Instructor)**

#### **Story 1.1: Create Live Course**
**As an Admin**, I want to create a Live Course with scheduling details, so students know when sessions occur.

**Acceptance Criteria:**
- [ ] Can select `kind = 'LIVE'` when creating course
- [ ] Must specify:
  - Course start date (first session)
  - Course end date (last session)
  - Total session count (e.g., 8 sessions)
  - Max students (enrollment limit)
  - Timezone (default to instructor's timezone)
- [ ] Course appears in "Upcoming Live Courses" on home page
- [ ] Validation: start_date must be in future, end_date > start_date

**Priority**: 🔴 P0 (Critical)  
**Effort**: 2 hours

---

#### **Story 1.2: Schedule Individual Sessions**
**As an Admin**, I want to schedule individual live sessions with specific dates/times, so students know when to join.

**Acceptance Criteria:**
- [ ] Can create multiple "Live Sessions" for a course
- [ ] Each session has:
  - Session number (1, 2, 3...)
  - Title (e.g., "Session 1: Introduction to React")
  - Description (session agenda)
  - Scheduled date & time (datetime)
  - Duration (in minutes, default 90)
  - Zoom meeting link (URL)
  - Status: SCHEDULED, LIVE, COMPLETED, CANCELLED
- [ ] Sessions displayed in chronological order
- [ ] Validation: sessions must be between course start_date and end_date
- [ ] Can edit/delete sessions (before they start)

**Priority**: 🔴 P0 (Critical)  
**Effort**: 3 hours

**Database**:
```sql
CREATE TABLE live_session (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    session_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 90,
    zoom_link VARCHAR(500),
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, COMPLETED, CANCELLED
    recording_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, session_number)
);
```

---

#### **Story 1.3: Integrate Zoom Links**
**As an Admin**, I want to add Zoom meeting links to each session, so students can join easily.

**Acceptance Criteria:**
- [ ] Text input for Zoom link (URL validation)
- [ ] Support both formats:
  - `https://zoom.us/j/123456789` (browser)
  - `zoommtg://zoom.us/join?confno=123456789` (app deep link)
- [ ] "Test Link" button (opens in new tab)
- [ ] Auto-detect if link is valid Zoom URL
- [ ] Help text: "Get link from Zoom.us → Schedule Meeting"

**Priority**: 🔴 P0 (Critical)  
**Effort**: 1 hour

---

### **Epic 2: Student Experience**

#### **Story 2.1: View Live Course Schedule**
**As a Student**, I want to see the full schedule of live sessions, so I can plan my attendance.

**Acceptance Criteria:**
- [ ] Course detail page shows "Schedule" tab for live courses
- [ ] Displays list of all sessions with:
  - Session number & title
  - Date & time (in student's local timezone)
  - Duration
  - Status badge (Upcoming / Live Now / Completed / Cancelled)
  - "Join Session" button (if live now)
  - Countdown timer (if upcoming within 24 hours)
- [ ] Past sessions show "View Recording" (if available)
- [ ] Empty state: "No sessions scheduled yet"

**Priority**: 🔴 P0 (Critical)  
**Effort**: 3 hours

---

#### **Story 2.2: Join Live Session**
**As a Student**, I want to join a live session when it's active, so I can learn in real-time.

**Acceptance Criteria:**
- [ ] "Join Session" button appears 10 minutes before start time
- [ ] Button disabled until session is active
- [ ] Click opens Zoom:
  - If Zoom app installed → open in app (deep link)
  - Else → open in browser
- [ ] Button shows different states:
  - "Starts in 2 hours" (upcoming)
  - "Join Now" (live)
  - "Ended" (completed)
- [ ] Enrollment required (can't join if not enrolled)

**Priority**: 🔴 P0 (Critical)  
**Effort**: 2 hours

---

#### **Story 2.3: View Session Countdown**
**As a Student**, I want to see a countdown to the next session, so I don't miss it.

**Acceptance Criteria:**
- [ ] Dashboard shows next upcoming session for each live course
- [ ] Countdown format:
  - "Starts in 2 days, 3 hours"
  - "Starts in 45 minutes"
  - "Live Now!" (pulsing badge)
- [ ] Quick "Join" button from dashboard
- [ ] Notification dot on course card if session starts within 1 hour

**Priority**: 🟡 P1 (High)  
**Effort**: 2 hours

---

### **Epic 3: Session Materials (Files)**

#### **Story 3.1: Upload Session Materials (Admin)**
**As an Admin**, I want to upload files for a session (slides, PDFs, Excel, etc.), so students can access materials.

**Acceptance Criteria:**
- [ ] "Upload Materials" button in session detail
- [ ] Supported file types:
  - Documents: PDF, DOC, DOCX, TXT
  - Spreadsheets: XLS, XLSX, CSV
  - Presentations: PPT, PPTX
  - Code: HTML, CSS, JS, JSON, XML
  - Images: JPG, PNG, GIF, SVG
  - Archives: ZIP
- [ ] Max file size: 50MB per file
- [ ] Multiple file upload (drag & drop)
- [ ] Upload to Cloudinary (document storage)
- [ ] Files linked to specific session
- [ ] Can upload before, during, or after session

**Priority**: 🔴 P0 (Critical)  
**Effort**: 3 hours

**Database**:
```sql
CREATE TABLE session_material (
    id BIGSERIAL PRIMARY KEY,
    live_session_id BIGINT NOT NULL REFERENCES live_session(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50), -- pdf, excel, image, etc.
    file_size_kb INT,
    uploaded_by BIGINT REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### **Story 3.2: Download Session Materials (Student)**
**As a Student**, I want to download session materials, so I can review them offline.

**Acceptance Criteria:**
- [ ] Materials section in session detail
- [ ] Shows list of uploaded files with:
  - File icon (based on type)
  - File name
  - File size
  - Upload date
  - Download button
- [ ] Click → download from Cloudinary
- [ ] Files only visible to enrolled students
- [ ] Empty state: "No materials uploaded yet"

**Priority**: 🔴 P0 (Critical)  
**Effort**: 2 hours

---

### **~~Epic 4: Live Quizzes~~** ❌ REMOVED
**Decision**: Not needed for live courses. Regular quizzes can be assigned as homework instead.

---

### **Epic 5: Student Submissions**

#### **Story 5.1: Create Assignment (Admin)**
**As an Admin**, I want to create assignments for students to submit work, so I can grade their understanding.

**Acceptance Criteria:**
- [ ] "Assignments" tab in live course admin
- [ ] Create assignment with:
  - Title (e.g., "Week 1 Project: Build a Portfolio")
  - Description (requirements, rubric)
  - Linked to session (optional)
  - Due date & time
  - Max file size (default 50MB)
  - Allowed file types
  - Max grade (points, e.g., 100)
- [ ] Assignments visible to enrolled students
- [ ] Students can upload files before deadline

**Priority**: 🟡 P1 (High)  
**Effort**: 3 hours

**Database**:
```sql
CREATE TABLE assignment (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    live_session_id BIGINT REFERENCES live_session(id), -- Optional link
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    max_file_size_mb INT DEFAULT 50,
    allowed_file_types VARCHAR(255), -- comma-separated
    max_grade INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submission (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignment(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT FALSE, -- TRUE if submitted after due date ⭐
    days_late INT DEFAULT 0, -- Number of days past due ⭐
    grade INT, -- Score out of max_grade
    feedback TEXT, -- Instructor comments
    graded_at TIMESTAMP,
    graded_by BIGINT REFERENCES users(id),
    UNIQUE(assignment_id, user_id)
);
```

---

#### **Story 5.2: Submit Assignment (Student)**
**As a Student**, I want to upload my assignment files, so my work can be graded.

**Acceptance Criteria:**
- [ ] "Assignments" tab in course learn page (live courses only)
- [ ] Shows list of assignments with:
  - Title & description
  - Due date (with countdown if < 7 days)
  - Status: Not Submitted / Submitted / Graded / **Late Submission** ⭐
  - Grade (if graded)
- [ ] Upload form:
  - File picker (drag & drop)
  - File validation (type, size)
  - "Submit" button
  - Confirmation dialog
- [ ] Can resubmit before deadline (overwrites previous)
- [ ] **After deadline**: ⭐
  - Still allows submission (enabled)
  - Shows warning: "⚠️ This assignment is past due. Your submission will be marked as late."
  - Badge: "LATE" (in red) next to submission
  - Timestamp shows "Submitted X days late"
  - Admin sees late indicator when grading
- [ ] Upload to Cloudinary

**Priority**: 🟡 P1 (High)  
**Effort**: 3 hours

---

#### **Story 5.3: Grade Submissions (Admin)**
**As an Admin**, I want to review and grade student submissions, so students receive feedback.

**Acceptance Criteria:**
- [ ] "Submissions" view in assignment detail
- [ ] Shows table of all students with:
  - Student name
  - Submission status (Submitted / Not Submitted)
  - Submission date
  - Download link
  - Grade input field
  - Feedback textarea
- [ ] Can download all submissions (bulk ZIP)
- [ ] Enter grade (0-max_grade)
- [ ] Enter text feedback
- [ ] "Save Grade" button
- [ ] Student sees grade in their assignments tab
- [ ] Email notification when graded (future)

**Priority**: 🟡 P1 (High)  
**Effort**: 3 hours

---

### **Epic 6: Session Recordings**

#### **Story 6.1: Upload Session Recording (Admin)**
**As an Admin**, I want to upload the Zoom recording after a session, so students who missed it can watch later.

**Acceptance Criteria:**
- [ ] "Upload Recording" button in completed session
- [ ] Accept video URLs:
  - Cloudinary video URL (if uploaded)
  - YouTube link
  - Vimeo link
  - Direct MP4/MKV URL
- [ ] Recording appears in session detail
- [ ] Only visible after session ends
- [ ] Optional: auto-fetch from Zoom Cloud (future)

**Priority**: 🟢 P2 (Medium)  
**Effort**: 2 hours

---

#### **Story 6.2: Watch Session Recording (Student)**
**As a Student**, I want to watch past session recordings, so I can review or catch up if I missed class.

**Acceptance Criteria:**
- [ ] "Recordings" tab in course learn page
- [ ] Shows list of sessions with recordings
- [ ] Click → video player (same as video lessons)
- [ ] Progress tracking (mark as watched)
- [ ] Only accessible to enrolled students
- [ ] Empty state: "No recordings available yet"

**Priority**: 🟢 P2 (Medium)  
**Effort**: 2 hours

---

### **Epic 7: Enrollment & Capacity**

#### **Story 7.1: Enrollment Limit**
**As an Admin**, I want to set max enrollment for live courses, so I can limit class size.

**Acceptance Criteria:**
- [ ] `max_students` field when creating live course
- [ ] Enrollment disabled when limit reached
- [ ] "Sold Out" badge on course card
- [ ] Wait list (optional, future feature)
- [ ] Admin can manually enroll (bypass limit)

**Priority**: 🟡 P1 (High)  
**Effort**: 1 hour

---

#### **Story 7.2: Course Roster (Admin)**
**As an Admin**, I want to see who's enrolled in my live course, so I can track attendance.

**Acceptance Criteria:**
- [ ] "Students" tab in admin course detail
- [ ] Shows table with:
  - Student name & email
  - Enrollment date
  - Sessions attended (count)
  - Assignments submitted (count)
  - Average grade
- [ ] Export roster (CSV)
- [ ] Send email to all students (future)

**Priority**: 🟢 P2 (Medium)  
**Effort**: 2 hours

---

### **Epic 8: Notifications & Reminders**

#### **Story 8.1: Session Reminders**
**As a Student**, I want to receive reminders before sessions start, so I don't miss them.

**Acceptance Criteria:**
- [ ] Email reminder 24 hours before session
- [ ] Email reminder 1 hour before session
- [ ] In-app notification (bell icon)
- [ ] Push notification (if mobile app)
- [ ] Settings: opt-in/out of reminders

**Priority**: 🟢 P2 (Medium)  
**Effort**: 3 hours (requires email service)

---

#### **Story 8.2: Assignment Due Reminders**
**As a Student**, I want reminders when assignments are due, so I submit on time.

**Acceptance Criteria:**
- [ ] Email reminder 3 days before due
- [ ] Email reminder 1 day before due
- [ ] In-app notification
- [ ] Badge on assignments tab (unsubmitted count)

**Priority**: 🟢 P2 (Medium)  
**Effort**: 2 hours (requires email service)

---

## 📊 **PRIORITY MATRIX**

### **Phase 1: MVP (Must Have)** 🔴 P0
**Effort**: 16 hours

1. ✅ Create Live Course (Story 1.1) - 2h
2. ✅ Schedule Sessions (Story 1.2) - 3h
3. ✅ Zoom Integration (Story 1.3) - 1h
4. ✅ View Schedule (Story 2.1) - 3h
5. ✅ Join Session (Story 2.2) - 2h
6. ✅ Upload Materials (Story 3.1) - 3h
7. ✅ Download Materials (Story 3.2) - 2h

**Deliverable**: Students can enroll, see schedule, join Zoom, and access materials.

---

### **Phase 2: Enhanced (Should Have)** 🟡 P1
**Effort**: 9 hours *(reduced from 14h - live quizzes removed)*

8. ✅ Session Countdown (Story 2.3) - 2h
9. ~~Live Quizzes~~ ❌ REMOVED
10. ✅ Create Assignments (Story 5.1) - 3h
11. ✅ Submit Assignments with Late Detection (Story 5.2) - 3h
12. ✅ Enrollment Limit (Story 7.1) - 1h

**Deliverable**: Interactive learning with assignments and late submission tracking.

---

### **Phase 3: Complete (Nice to Have)** 🟢 P2
**Effort**: 10 hours

13. ✅ Grade Submissions (Story 5.3) - 3h
14. ✅ Session Recordings (Story 6.1 + 6.2) - 4h
15. ✅ Course Roster (Story 7.2) - 2h
16. ✅ Notifications (Story 8.1 + 8.2) - 5h (requires email)

**Deliverable**: Full-featured live course platform.

---

## 🗄️ **DATABASE SCHEMA SUMMARY**

### **New Tables:**
1. `live_session` - Individual session scheduling
2. `session_material` - Files shared in sessions
3. `assignment` - Homework/projects
4. `submission` - Student work uploads

### **Modified Tables:**
1. `course` - Already has `kind='LIVE'`, `start_date`, `end_date`, `max_students`
2. ~~`quiz`~~ - ❌ No changes needed (live quizzes removed from scope)

### **Total Database Changes:**
- 4 new tables
- 0 modified tables
- ~8 new indexes

---

## 🎨 **UI/UX REQUIREMENTS**

### **Admin Panel:**
- **Live Course Editor**: Add "Sessions" tab with session list + "New Session" button
- **Session Detail**: Form with date/time picker, Zoom link, materials upload
- **Assignments Tab**: CRUD for assignments, view submissions, grading interface

### **Student Facing:**
- **Course Detail**: "Schedule" tab showing all sessions
- **Session Card**: Shows date, time, status, countdown, "Join" button
- **Course Learn Page**: "Materials" tab (files), "Assignments" tab (upload form), "Recordings" tab

### **Dashboard:**
- **Live Course Card**: Shows next session countdown + "Join" button if live

---

## ✅ **DEFINITION OF DONE**

A Live Course feature is complete when:

### **Admin Can:**
- [ ] Create a live course with schedule
- [ ] Add multiple sessions with Zoom links
- [ ] Upload session materials (PDF, Excel, images, etc.)
- [ ] Create assignments with due dates
- [ ] View and grade student submissions
- [ ] Upload session recordings

### **Student Can:**
- [ ] Enroll in live course (if capacity available)
- [ ] View full session schedule
- [ ] See countdown to next session
- [ ] Join live session via Zoom (10 min before start)
- [ ] Download session materials
- [ ] Take live quizzes during session
- [ ] Upload assignment submissions before deadline
- [ ] Watch session recordings after class

### **System:**
- [ ] Sessions sorted chronologically
- [ ] "Live Now" status detected automatically
- [ ] Enrollment limit enforced
- [ ] Files stored in Cloudinary
- [ ] All data persisted in PostgreSQL
- [ ] API documented in Swagger
- [ ] Frontend responsive (mobile-friendly)

---

## 🚀 **IMPLEMENTATION ORDER**

### **Week 1: Phase 1 MVP (16 hours)**
**Goal**: Basic live course functionality

**Day 1 (4h):**
- Database migration (create tables)
- Backend models (LiveSession, SessionMaterial)
- Backend services (LiveSessionService)

**Day 2 (4h):**
- Admin session CRUD endpoints
- Admin UI: Sessions tab in course editor
- Session form (date/time, Zoom link)

**Day 3 (4h):**
- Student schedule view (frontend)
- Join button logic (time-based)
- Zoom link integration

**Day 4 (4h):**
- File upload for session materials
- Cloudinary integration (document storage)
- Student download materials

**Deliverable**: Working live course with sessions and materials ✅

---

### **Week 2: Phase 2 Enhanced (14 hours)**
**Goal**: Quizzes and assignments

**Day 1 (3h):**
- Modify quiz system for live quizzes
- Link quiz to session
- Time-based availability

**Day 2 (3h):**
- Assignment creation (admin)
- Assignment database setup

**Day 3 (4h):**
- Student submission form
- File upload to Cloudinary
- Due date enforcement

**Day 4 (3h):**
- Countdown timers (sessions, assignments)
- Enrollment limit logic
- Polish UI

**Deliverable**: Interactive live courses with assessment ✅

---

### **Week 3: Phase 3 Complete (10 hours)**
**Goal**: Grading and recordings

**Day 1 (3h):**
- Grading interface (admin)
- Feedback system
- Grade display (student)

**Day 2 (4h):**
- Recording upload
- Recording player
- Progress tracking for recordings

**Day 3 (3h):**
- Course roster view
- Export features
- Email notifications (if email service ready)

**Deliverable**: Full-featured live course platform ✅

---

## 📋 **DEPENDENCIES**

### **Required Before Start:**
- ✅ Cloudinary integration (for file uploads) - DONE
- ✅ Quiz system (for live quizzes) - DONE
- ✅ User authentication (for enrollment) - DONE

### **Optional (Enhances Feature):**
- ⏳ Email service (for reminders)
- ⏳ Video hosting (for recordings, can use YouTube for now)
- ⏳ Calendar integration (add to Google Calendar)

---

## 🎯 **SUCCESS METRICS**

### **MVP Success:**
- [ ] Admin can create and schedule live course
- [ ] Student can join Zoom session
- [ ] Student can download materials
- [ ] 0 critical bugs

### **Enhanced Success:**
- [ ] Students complete live quizzes during session
- [ ] Students submit assignments
- [ ] Admin can grade submissions
- [ ] Average session attendance > 60%

### **Complete Success:**
- [ ] All stories implemented
- [ ] Email reminders sent
- [ ] Recordings available
- [ ] Student satisfaction > 4/5 stars

---

## ✅ **DECISIONS MADE**

1. **Zoom Account**: ✅ Will use Zoom links (admin provides links manually)
2. **Recording Storage**: ✅ Zoom links (recordings stay in Zoom Cloud)
3. **Grading Scale**: ✅ Same as pre-recorded courses (numeric grades)
4. **Late Submissions**: ✅ Allowed but clearly marked as "LATE" with timestamp
5. **Live Quizzes**: ❌ Not needed (removed from scope)
6. **Priority**: ✅ HIGH - Start with Phase 1 MVP (16 hours → now 11 hours without quizzes)

---

**Next Step**: Review this backlog, approve, and we'll start Phase 1 implementation! 🚀

