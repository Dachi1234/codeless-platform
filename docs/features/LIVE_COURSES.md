# 📅 Live Courses Feature

**Version**: 1.0.0  
**Status**: ✅ **Production Ready**  
**Last Updated**: October 11, 2025

---

## 📖 **Overview**

The **Live Courses** feature enables instructors to conduct real-time, scheduled learning sessions with students via Zoom integration. This feature supports scheduled sessions, material sharing, assignments, submissions, and grading - providing a complete virtual classroom experience.

---

## 🎯 **Purpose**

- Enable **live, instructor-led training** alongside pre-recorded courses
- Support **scheduled Zoom sessions** with real-time interaction
- Facilitate **assignment submission and grading** workflows
- Allow **material sharing** during and after sessions
- Track **student progress** through assignments and grades

---

## 👥 **User Roles**

### **Admin/Instructor**
- Create and schedule live sessions
- Upload session materials (PDFs, docs, images, etc.)
- Update session status (SCHEDULED → LIVE → COMPLETED)
- Create assignments with validation rules
- View all student submissions
- Grade submissions with feedback

### **Student**
- View session schedule (upcoming and past)
- Join Zoom sessions with one click
- Download session materials
- Submit assignments with file validation
- View grades and instructor feedback
- Track late submissions

---

## 🔑 **Key Features**

### **1. Live Sessions Management**

#### **Admin Features:**
- Schedule sessions with date/time
- Zoom link integration
- Session duration tracking
- Status management:
  - **SCHEDULED** - Waiting to start
  - **LIVE** - Currently in progress (pulsing indicator)
  - **COMPLETED** - Finished with optional recording
  - **CANCELLED** - Cancelled session
- Upload session materials (unlimited files)
- Add recording links post-session

#### **Student Features:**
- View upcoming sessions (next 7 days)
- "Join Live Session" button when LIVE
- Access past session recordings
- Download all session materials
- "Starting soon" indicator (24 hours before)

---

### **2. Session Materials**

#### **File Support:**
- **Documents**: PDF, DOC, DOCX
- **Spreadsheets**: XLS, XLSX
- **Presentations**: PPT, PPTX
- **Images**: JPG, PNG
- **Web**: HTML
- **Archives**: ZIP

#### **Features:**
- Upload during or after sessions
- Auto file type detection with icons
- File size display
- Direct download links
- Delete materials (Admin only)
- Stored in Cloudinary CDN

---

### **3. Assignments System**

#### **Assignment Configuration:**
- Title and description
- Due date/time
- Max grade (points)
- Max file size (1-100 MB)
- Allowed file types (multi-select)
- Optional link to specific session

#### **Validation:**
- File type checking (client + server)
- File size limits
- Due date enforcement
- Late submission tracking

#### **Grading Workflow:**
1. Student submits file
2. System detects if late (auto-calculated)
3. Admin views submissions table
4. Admin grades with score and feedback
5. Student views grade and feedback

---

### **4. Late Submission Handling**

#### **Automatic Detection:**
```
if (submission_time > due_date) {
  is_late = TRUE
  days_late = CEIL((submission_time - due_date) / 1 day)
}
```

#### **Student Indicators:**
- ⚠️ "Overdue" warning before submission
- "Late (X days)" badge on submission
- Orange/red color coding

#### **Admin View:**
- Late badge in submissions table
- Days late counter
- Filterable by late status

---

## 🗄️ **Database Schema**

### **Tables Created:**

#### **`live_session`**
```sql
- id (BIGSERIAL PRIMARY KEY)
- course_id (FK → course)
- session_number (INT)
- title (VARCHAR 255)
- description (TEXT)
- scheduled_at (TIMESTAMP WITH TIME ZONE)
- duration_minutes (INT)
- zoom_link (VARCHAR 500)
- recording_url (VARCHAR 500, optional)
- status (VARCHAR 50: SCHEDULED/LIVE/COMPLETED/CANCELLED)
- created_at, updated_at
```

#### **`session_material`**
```sql
- id (BIGSERIAL PRIMARY KEY)
- session_id (FK → live_session)
- title (VARCHAR 255)
- file_name (VARCHAR 255)
- file_url (VARCHAR 500) -- Cloudinary
- file_type (VARCHAR 100)
- uploaded_at (TIMESTAMP)
```

#### **`assignment`**
```sql
- id (BIGSERIAL PRIMARY KEY)
- course_id (FK → course)
- live_session_id (FK → live_session, optional)
- title (VARCHAR 255)
- description (TEXT)
- due_date (TIMESTAMP WITH TIME ZONE)
- max_file_size_mb (INT)
- allowed_file_types (VARCHAR 255) -- CSV
- max_grade (INT)
- created_at, updated_at
```

#### **`submission`**
```sql
- id (BIGSERIAL PRIMARY KEY)
- assignment_id (FK → assignment)
- user_id (FK → users)
- file_name (VARCHAR 255)
- file_url (VARCHAR 500) -- Cloudinary
- submitted_at (TIMESTAMP)
- is_late (BOOLEAN)
- days_late (INT)
- grade (INT, nullable)
- feedback (TEXT, nullable)
- graded_at (TIMESTAMP, nullable)
- graded_by (FK → users, nullable)
- UNIQUE(assignment_id, user_id) -- One submission per user
```

---

## 🔌 **API Endpoints**

### **Live Sessions** (8 endpoints)

#### **Admin:**
```
POST   /api/admin/courses/{courseId}/sessions        Create session
PUT    /api/admin/sessions/{sessionId}               Update session
PATCH  /api/admin/sessions/{sessionId}/status        Update status
DELETE /api/admin/sessions/{sessionId}               Delete session
```

#### **Public/Student:**
```
GET    /api/courses/{courseId}/sessions              All sessions
GET    /api/courses/{courseId}/sessions/upcoming     Upcoming only
GET    /api/courses/{courseId}/sessions/past         Past only
GET    /api/courses/{courseId}/sessions/{sessionId}  Get one
```

---

### **Session Materials** (3 endpoints)

```
POST   /api/admin/sessions/{sessionId}/materials     Upload (Admin)
GET    /api/sessions/{sessionId}/materials           List materials
DELETE /api/admin/materials/{materialId}             Delete (Admin)
```

---

### **Assignments** (7 endpoints)

#### **Admin:**
```
POST   /api/admin/courses/{courseId}/assignments     Create assignment
PUT    /api/admin/assignments/{assignmentId}         Update assignment
DELETE /api/admin/assignments/{assignmentId}         Delete assignment
```

#### **Public/Student:**
```
GET    /api/courses/{courseId}/assignments           All assignments
GET    /api/courses/{courseId}/assignments/upcoming  Upcoming only
GET    /api/courses/{courseId}/assignments/past      Past only
GET    /api/courses/{courseId}/assignments/{id}      Get one
```

---

### **Submissions** (10 endpoints)

#### **Student:**
```
POST   /api/assignments/{assignmentId}/submit        Submit assignment
GET    /api/assignments/{assignmentId}/my-submission My submission
GET    /api/users/{userId}/courses/{courseId}/submissions  My submissions for course
```

#### **Admin:**
```
GET    /api/admin/assignments/{assignmentId}/submissions         All submissions
GET    /api/admin/assignments/{assignmentId}/submissions/ungraded Ungraded only
POST   /api/admin/submissions/{submissionId}/grade              Grade submission
PUT    /api/admin/submissions/{submissionId}                    Update grade
DELETE /api/admin/submissions/{submissionId}                    Delete submission
GET    /api/assignments/{assignmentId}/submissions/{submissionId} Get one
```

---

## 🎨 **User Interface**

### **Admin Routes**

#### **Sessions Editor** (`/admin/courses/:id/sessions`)
- Sessions list with cards
- Create/Edit modal
- Status update buttons
- Material upload section
- Delete confirmations

#### **Assignments Editor** (`/admin/courses/:id/assignments`)
- Assignments list
- Create/Edit modal with file type selector
- Grading modal:
  - Submissions table
  - Inline grading form
  - Filter by status

---

### **Student Routes**

#### **Live Course View** (`/courses/:id/live`)

**Schedule Tab:**
- Course header with back button
- Upcoming sessions section:
  - Session cards with details
  - Status badges
  - Join/Zoom buttons
  - Materials list
- Past sessions section:
  - Recording links
  - Materials archive

**Assignments Tab:**
- Assignment cards with:
  - Title, description
  - Due date with overdue warnings
  - Requirements (file types, size, max grade)
  - Status badges
- Upload form:
  - File picker with validation
  - Late submission warning
  - Submit button
- Submission display:
  - Uploaded file link
  - Submission timestamp
  - Late indicator
- Grade display:
  - Score and percentage
  - Instructor feedback
  - Graded date

---

## 🔐 **Security**

### **Authentication**
- All endpoints require JWT authentication
- Admin endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`
- Student endpoints check enrollment status

### **Authorization**
- Students can only:
  - View courses they're enrolled in
  - Submit their own assignments
  - View their own submissions/grades
- Admins can:
  - Manage all courses
  - View all submissions
  - Grade all assignments

### **File Upload Security**
- File type validation (client + server)
- File size limits enforced
- Files stored in Cloudinary (not local server)
- Unique filenames prevent overwrites
- Virus scanning via Cloudinary (optional)

---

## 📊 **Business Logic**

### **Late Submission Calculation**
```java
OffsetDateTime submittedAt = OffsetDateTime.now();
boolean isLate = submittedAt.isAfter(assignment.getDueDate());
int daysLate = 0;

if (isLate) {
    Duration duration = Duration.between(assignment.getDueDate(), submittedAt);
    daysLate = (int) Math.ceil(duration.toDays());
}

submission.setIsLate(isLate);
submission.setDaysLate(daysLate);
```

### **Session Status Flow**
```
SCHEDULED → (Admin clicks "Mark as Live") → LIVE
LIVE → (Admin clicks "Mark as Completed") → COMPLETED
SCHEDULED → (Admin clicks "Cancel") → CANCELLED
```

### **Assignment Validation**
```java
// File size check
if (file.getSize() / (1024 * 1024) > assignment.getMaxFileSizeMb()) {
    throw new ValidationException("File too large");
}

// File type check
String extension = file.getOriginalFilename().split("\\.").pop();
if (!assignment.getAllowedFileTypes().contains(extension)) {
    throw new ValidationException("File type not allowed");
}
```

---

## 🧪 **Testing**

### **Test Scenarios**

1. **Session Lifecycle:**
   - Create session → Schedule → Mark Live → Complete
   - Upload materials → Download → Delete
   - Cancel session

2. **Assignment Flow:**
   - Create assignment → Submit on time → Grade
   - Submit late → Verify late indicator
   - Resubmit (update) → Verify replacement

3. **Validation:**
   - Upload oversized file → Should fail
   - Upload wrong file type → Should fail
   - Submit before due date → Should succeed
   - Submit after due date → Should mark as late

4. **Access Control:**
   - Student tries admin endpoint → Should fail (403)
   - Student views other student's submission → Should fail (403)
   - Unenrolled student accesses course → Should fail (401/403)

---

## 🚀 **Deployment**

### **Prerequisites**
- PostgreSQL with migration V19
- Cloudinary account (for file storage)
- Zoom account (for meeting links)

### **Environment Variables**

**Backend (.env or Render):**
```bash
# Database
DB_URL=jdbc:postgresql://...
DB_USERNAME=...
DB_PASSWORD=...

# Cloudinary (required)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Security
SECURITY_JWT_SECRET=...
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

**Frontend (environment.ts):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend.com',
};
```

### **Database Migration**
```bash
# Automatically runs on backend startup via Flyway
# Or manually:
psql -U user -d db -f V19__add_live_course_tables.sql
```

---

## 📈 **Performance Considerations**

### **Database Indexes**
```sql
-- Already created in V19:
CREATE INDEX idx_live_session_course_id ON live_session(course_id);
CREATE INDEX idx_live_session_start_time ON live_session(start_time);
CREATE INDEX idx_assignment_course_id ON assignment(course_id);
CREATE INDEX idx_assignment_due_date ON assignment(due_date);
CREATE INDEX idx_submission_assignment_id ON submission(assignment_id);
CREATE INDEX idx_submission_user_id ON submission(user_id);
CREATE INDEX idx_submission_is_late ON submission(is_late);
```

### **Caching Strategy**
- Session schedules: Cache for 5 minutes
- Materials list: Cache until upload/delete
- Student submissions: No cache (real-time grading)

### **File Storage**
- All files stored in Cloudinary CDN
- Automatic image optimization
- Global CDN delivery
- Max file size: 100 MB (configurable per assignment)

---

## 🔧 **Configuration**

### **Assignment Defaults**
```java
// In AssignmentsEditorComponent
maxFileSizeMb: 50,
allowedFileTypes: 'pdf,docx,zip',
maxGrade: 100
```

### **Session Defaults**
```java
// In LiveSessionsEditorComponent
durationMinutes: 90,
status: 'SCHEDULED'
```

---

## 🐛 **Troubleshooting**

### **Issue: Tables not found**
**Solution**: Run migration V19
```bash
psql -U user -d db -f V19__add_live_course_tables.sql
```

### **Issue: File upload fails**
**Solution**: Check Cloudinary credentials in `.env`

### **Issue: Late detection not working**
**Solution**: Ensure server timezone is UTC

### **Issue: Students can't access live course**
**Solution**: 
1. Check enrollment status
2. Verify course kind is 'LIVE'
3. Use `/courses/{id}/live` route (not `/learn`)

---

## 📚 **Related Documentation**

- [Testing Guide](../updates/LIVE_COURSES_TESTING_GUIDE.md)
- [API Documentation](http://localhost:8080/swagger-ui.html)
- [Cloudinary Setup](../setup/CLOUDINARY_SETUP.md)
- [Database Schema](../../backend/codeless-backend/src/main/resources/db/migration/V19__add_live_course_tables.sql)

---

## 🎯 **Future Enhancements**

### **Potential Features:**
- ✨ Email notifications for upcoming sessions
- ✨ Calendar integration (iCal export)
- ✨ Batch grading interface
- ✨ Assignment rubrics
- ✨ Peer review system
- ✨ Auto-grading for code submissions
- ✨ Video recording embedding
- ✨ Live chat during sessions
- ✨ Breakout rooms support
- ✨ Attendance tracking

---

## 📝 **Version History**

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Oct 11, 2025 | Initial release |

---

**Status**: ✅ **Production Ready**  
**Maintained by**: Development Team  
**Last Review**: October 11, 2025
