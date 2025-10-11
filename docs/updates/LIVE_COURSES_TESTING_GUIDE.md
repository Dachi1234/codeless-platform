# 🧪 LIVE COURSES - Testing Guide

**Date**: October 11, 2025, 02:30  
**Status**: ✅ **BUILD SUCCESSFUL** - Ready to Test!  

---

## 🚀 **QUICK START**

### **1. Start Backend**
```powershell
cd backend\codeless-backend
mvn spring-boot:run
```

**Expected**: Backend starts on `http://localhost:8080`

### **2. Start Frontend**
```powershell
cd frontend
npm start
```

**Expected**: Frontend starts on `http://localhost:4200`

---

## ✅ **TESTING CHECKLIST**

### **Phase 1: Admin - Create Live Course** (5 min)

1. **Login as Admin**
   - Go to `http://localhost:4200/login`
   - Use admin credentials

2. **Create LIVE Course**
   - Navigate to `/admin/courses`
   - Click "Create Course"
   - Fill in form:
     - Title: "Full Stack Development Bootcamp"
     - Kind: **LIVE** ⚠️ (Critical!)
     - Category: "Web Development"
     - Level: "Intermediate"
     - Price: $499
     - Instructor Name: "John Doe"
   - Save course

3. **Verify**
   - ✅ Course appears in admin courses list
   - ✅ "📅 Sessions" button visible
   - ✅ "📝 Assignments" button visible

---

### **Phase 2: Admin - Schedule Sessions** (10 min)

4. **Open Sessions Editor**
   - Click "📅 Sessions" button for your LIVE course
   - Route: `/admin/courses/{id}/sessions`

5. **Create Session 1**
   - Click "Add Session"
   - Fill form:
     - Session Number: 1
     - Title: "Introduction to React"
     - Description: "Learn React basics and component architecture"
     - Scheduled Date/Time: Pick a future date (e.g., tomorrow 10:00 AM)
     - Duration: 90 minutes
     - Zoom Link: `https://zoom.us/j/123456789` (use real or fake)
     - Status: SCHEDULED
   - Save

6. **Create Session 2**
   - Repeat with different title: "Advanced React Hooks"
   - Schedule for next week

7. **Upload Materials for Session 1**
   - Find Session 1 card
   - Scroll to "Materials" section
   - Click file input
   - Select a PDF/Word/image file
   - Click "📤 Upload Material"

8. **Verify**
   - ✅ 2 sessions visible in list
   - ✅ Sessions show correct info (date, time, zoom link)
   - ✅ Status badges display correctly
   - ✅ Material shows with file icon and name
   - ✅ Can download material

9. **Test Status Updates**
   - Click "Mark as Live" on Session 1
   - ✅ Status changes to LIVE with red pulsing badge
   - Click "Mark as Completed"
   - ✅ Status changes to COMPLETED with green badge

---

### **Phase 3: Admin - Create Assignments** (10 min)

10. **Open Assignments Editor**
    - Click "📝 Assignments" button
    - Route: `/admin/courses/{id}/assignments`

11. **Create Assignment 1**
    - Click "Create Assignment"
    - Fill form:
      - Title: "Build a To-Do App"
      - Description: "Create a React to-do app with add, edit, delete functionality"
      - Due Date: Pick a date 1 week from now
      - Max Grade: 100
      - Max File Size: 50 MB
      - Allowed File Types: Check "PDF", "ZIP", "Image (PNG)"
      - Link to Session: Select "Session 1: Introduction to React"
    - Save

12. **Create Assignment 2**
    - Title: "Component Refactoring Exercise"
    - Due Date: Pick a date 2 weeks from now
    - Link to Session 2

13. **Verify**
    - ✅ 2 assignments visible
    - ✅ Assignments show correct due dates
    - ✅ Linked session shows in card

---

### **Phase 4: Student - View Schedule** (5 min)

14. **Enroll in Course** (if not already enrolled)
    - Logout, login as student (or create new user)
    - Go to course detail page
    - Click "Enroll"/"Buy Now"

15. **Access Live Course**
    - Go to Dashboard
    - Click on the LIVE course
    - Route: `/courses/{id}/live` ⚠️ (Not `/learn`!)

16. **Check Schedule Tab**
    - ✅ See "Upcoming Sessions" section
    - ✅ Session 1 shows with all details
    - ✅ "Zoom Link" button visible and clickable
    - ✅ Materials section shows uploaded file
    - ✅ Can download material

17. **Check Past Sessions**
    - If you marked Session 1 as COMPLETED:
    - ✅ It appears in "Past Sessions" section

---

### **Phase 5: Student - Submit Assignment** (10 min)

18. **Switch to Assignments Tab**
    - Click "📝 Assignments" tab

19. **View Assignment 1**
    - ✅ Title and description visible
    - ✅ Due date displayed
    - ✅ Max grade shown (100 points)
    - ✅ Allowed file types shown
    - ✅ Status badge: "Not Submitted"

20. **Submit Assignment**
    - Scroll to "Submit Your Work" section
    - Click file input
    - Select a PDF or ZIP file
    - ✅ Validate: If you select wrong file type → should fail
    - ✅ Validate: If file too large → should fail
    - Click "Submit Assignment"

21. **Verify Submission**
    - ✅ Alert: "Assignment submitted successfully!"
    - ✅ "Submit Your Work" section disappears
    - ✅ "Your Submission" section appears
    - ✅ Shows uploaded file name with download link
    - ✅ Shows submission timestamp
    - ✅ Status badge: "Submitted"
    - ✅ If submitted late: Shows "Late (X days)" badge

---

### **Phase 6: Admin - Grade Assignment** (10 min)

22. **Back to Admin - Assignments Editor**
    - Go to `/admin/courses/{id}/assignments`
    - Click "📊" (View Submissions) on Assignment 1

23. **View Submissions Table**
    - ✅ See 1 submission from student
    - ✅ Student name and email visible
    - ✅ Submitted file link clickable
    - ✅ Submission timestamp correct
    - ✅ Status: "Submitted" or "Late"

24. **Grade the Submission**
    - Click "Grade" button
    - ✅ Grading form expands inline
    - Enter grade: 85 (out of 100)
    - Enter feedback: "Great work! Consider adding error handling."
    - Click "Submit Grade"

25. **Verify Grading**
    - ✅ Grading form closes
    - ✅ Grade column shows "85 / 100"
    - ✅ Status badge: "Graded"

---

### **Phase 7: Student - View Grade** (5 min)

26. **Back to Student - Assignments Tab**
    - Refresh page: `/courses/{id}/live` → Assignments tab

27. **Check Graded Assignment**
    - ✅ Status badge: "Graded"
    - ✅ Grade display section appears
    - ✅ Shows: "Grade: 85 / 100 (85%)"
    - ✅ Shows feedback text
    - ✅ Shows graded date

---

## 🎯 **EDGE CASES TO TEST**

### **Late Submissions**
1. Create assignment with past due date
2. Submit as student
3. ✅ Warning: "This assignment is overdue..."
4. ✅ Submission shows "Late (X days)" badge
5. ✅ Admin sees late indicator in submissions table

### **File Validation**
1. Try uploading file larger than max size
2. ✅ Error: "File size exceeds the limit"
3. Try uploading wrong file type (e.g., .exe)
4. ✅ Error: "File type .exe is not allowed"

### **Session Status Flow**
1. SCHEDULED → Click "Mark as Live"
2. ✅ Status: LIVE (red pulsing)
3. LIVE → Click "Mark as Completed"
4. ✅ Status: COMPLETED (green)
5. SCHEDULED → Click "Cancel Session"
6. ✅ Status: CANCELLED (gray, strikethrough)

### **Multiple Students**
1. Create 2 student accounts
2. Both submit Assignment 1
3. ✅ Admin sees 2 submissions in table
4. ✅ Can grade each independently

---

## 🐛 **KNOWN ISSUES TO WATCH FOR**

### **Backend**
- ⚠️ Ensure `.env` file exists with Cloudinary credentials
- ⚠️ Database migration V19 must run successfully

### **Frontend**
- ⚠️ LIVE courses must use `/courses/{id}/live` route (not `/learn`)
- ⚠️ Budget warnings in build (not critical)

---

## 📊 **EXPECTED API CALLS**

### **Sessions**
- `GET /api/courses/{id}/sessions` - List sessions
- `GET /api/sessions/{id}/materials` - Materials per session
- `POST /api/admin/courses/{id}/sessions` - Create session (Admin)

### **Assignments**
- `GET /api/courses/{id}/assignments` - List assignments
- `POST /api/assignments/{id}/submit` - Submit (Student)
- `GET /api/assignments/{id}/my-submission` - My submission
- `POST /api/admin/submissions/{id}/grade` - Grade (Admin)

---

## ✅ **SUCCESS CRITERIA**

### **Admin**
- ✅ Can create LIVE course
- ✅ Can schedule multiple sessions
- ✅ Can upload session materials
- ✅ Can create assignments with validation rules
- ✅ Can view all submissions
- ✅ Can grade submissions with feedback
- ✅ Can update session status

### **Student**
- ✅ Can view schedule with upcoming/past sessions
- ✅ Can join Zoom links
- ✅ Can download session materials
- ✅ Can view all assignments
- ✅ Can submit assignments (with validation)
- ✅ Sees late submission warnings
- ✅ Can view grades and feedback

---

## 🎉 **IF ALL TESTS PASS**

**Congratulations!** 🚀 The Live Courses feature is **FULLY FUNCTIONAL** and ready for production!

**Next Steps:**
1. Deploy to Neon (database already has V19 migration)
2. Update Render environment variables (if needed)
3. Deploy to Vercel
4. Test in production

---

**Total Testing Time**: ~55 minutes  
**Confidence Level**: 🟢 HIGH (Build successful, 0 errors)

