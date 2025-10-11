# 📋 Manual Testing Guide - Codeless E-Learning Platform

**Version**: 1.0  
**Last Updated**: October 11, 2025  
**Platform URL**: https://codeless.digital  
**Admin Email**: (use your admin account)  
**Test User**: Create a new user for testing

---

## 🎯 Testing Overview

This guide covers **manual testing** for all features of the Codeless platform.  
Each test case includes:
- **Test ID** - Unique identifier
- **Feature** - What you're testing
- **Steps** - What to do
- **Expected Result** - What should happen

---

## 📝 Test Preparation

### Before You Start:
1. Open browser (Chrome or Edge recommended)
2. Go to https://codeless.digital
3. Have two browser profiles ready:
   - **Profile 1**: Admin account
   - **Profile 2**: Regular student account
4. Clear browser cache if testing after updates

---

## 🔐 Authentication & User Management

### TC-001: User Registration
**Feature**: New user sign-up  
**Steps**:
1. Click "Register" in header
2. Enter full name: "Test Student"
3. Enter email: "teststudent@example.com"
4. Enter password: "Test123!"
5. Click "Register"

**Expected Result**:
- ✅ Account created successfully
- ✅ Redirected to login page
- ✅ Success message appears

---

### TC-002: User Login
**Feature**: User authentication  
**Steps**:
1. Go to login page
2. Enter email: "teststudent@example.com"
3. Enter password: "Test123!"
4. Click "Login"

**Expected Result**:
- ✅ Logged in successfully
- ✅ Redirected to home page
- ✅ User name appears in header
- ✅ "Dashboard" and "Logout" buttons visible

---

### TC-003: User Logout
**Feature**: User logout  
**Steps**:
1. While logged in, click "Logout" button in header
2. Observe the page

**Expected Result**:
- ✅ Logged out successfully
- ✅ Redirected to home page
- ✅ Header shows "Login" and "Register" buttons

---

### TC-004: Profile Update
**Feature**: Edit user profile  
**Steps**:
1. Login as student
2. Click on your name in header → "Dashboard"
3. Click "Edit Profile" button
4. Change name to "Test Student Updated"
5. Click "Save"

**Expected Result**:
- ✅ Profile updated message appears
- ✅ Name in header changes to "Test Student Updated"
- ✅ Avatar updates (first letter changes)

---

## 📚 Course Browsing & Discovery

### TC-005: Browse All Courses
**Feature**: Course catalog  
**Steps**:
1. Click "Courses" in navigation menu
2. Scroll through the course list

**Expected Result**:
- ✅ All courses displayed with cards
- ✅ Each card shows: title, price, rating, instructor, image
- ✅ "View Details" button on each card

---

### TC-006: Search Courses
**Feature**: Course search  
**Steps**:
1. Go to Courses page
2. Type "Web" in search box
3. Observe filtered results

**Expected Result**:
- ✅ Only courses with "Web" in title appear
- ✅ Results update as you type
- ✅ "No courses found" if no matches

---

### TC-007: Filter by Category
**Feature**: Course filtering  
**Steps**:
1. Go to Courses page
2. Click "Category" dropdown
3. Select "Web Development"
4. Observe results

**Expected Result**:
- ✅ Only "Web Development" courses shown
- ✅ Filter badge appears above results
- ✅ Can clear filter by clicking X

---

### TC-008: Filter by Price Range
**Feature**: Price filtering  
**Steps**:
1. Go to Courses page
2. Click "Price Range" dropdown
3. Select "Free"
4. Observe results

**Expected Result**:
- ✅ Only free courses (price = 0) shown
- ✅ Paid courses hidden

---

### TC-009: Sort Courses
**Feature**: Course sorting  
**Steps**:
1. Go to Courses page
2. Click "Sort By" dropdown
3. Select "Price: Low to High"

**Expected Result**:
- ✅ Courses reorder by price (cheapest first)
- ✅ Free courses appear first

---

### TC-010: View Course Details
**Feature**: Course detail page  
**Steps**:
1. Go to Courses page
2. Click "View Details" on any course
3. Review the page

**Expected Result**:
- ✅ Course image, title, price shown
- ✅ Tabs: Overview, Syllabus, Reviews
- ✅ "Enroll Now" or "Go to Course" button
- ✅ Instructor info displayed

---

### TC-011: View Course Syllabus
**Feature**: Course curriculum display  
**Steps**:
1. On course detail page
2. Click "Syllabus" tab
3. Observe curriculum structure

**Expected Result**:
- ✅ Sections and lessons displayed
- ✅ Lesson icons (video, article, quiz)
- ✅ Lesson durations shown
- ✅ Can expand/collapse sections

---

## 💳 Enrollment & Checkout

### TC-012: Enroll in Free Course
**Feature**: Free course enrollment  
**Steps**:
1. Login as student
2. Find a FREE course (price = $0)
3. Click "Enroll Now"
4. Confirm enrollment

**Expected Result**:
- ✅ Enrolled immediately (no payment)
- ✅ Button changes to "Go to Course"
- ✅ Course appears in Dashboard
- ✅ Success message shown

---

### TC-013: Add Paid Course to Cart
**Feature**: Shopping cart  
**Steps**:
1. Login as student
2. Find a PAID course
3. Click "Add to Cart"
4. Click cart icon in header

**Expected Result**:
- ✅ Course added to cart
- ✅ Cart icon shows count (1)
- ✅ Cart page shows course with price
- ✅ Total amount calculated

---

### TC-014: Remove from Cart
**Feature**: Cart management  
**Steps**:
1. Go to cart page (with items)
2. Click "Remove" on a course
3. Observe cart

**Expected Result**:
- ✅ Course removed from cart
- ✅ Total updates
- ✅ Cart count decreases
- ✅ "Cart is empty" if no items

---

### TC-015: Checkout with PayPal
**Feature**: PayPal payment (Sandbox)  
**Steps**:
1. Add paid course to cart
2. Click "Proceed to Checkout"
3. Click "Pay with PayPal" button
4. Login to PayPal sandbox
5. Complete payment
6. Return to site

**Expected Result**:
- ✅ Redirected to PayPal
- ✅ After payment, redirected back
- ✅ Enrolled in course
- ✅ Course appears in Dashboard
- ✅ Order created

---

## 🎓 Learning Experience

### TC-016: Start Course
**Feature**: Begin learning  
**Steps**:
1. Go to Dashboard
2. Click "Continue Learning" on enrolled course
3. Observe learning page

**Expected Result**:
- ✅ Course learning interface loads
- ✅ First lesson selected automatically
- ✅ Sidebar shows curriculum
- ✅ Lesson content displays

---

### TC-017: Watch Video Lesson
**Feature**: Video player  
**Steps**:
1. In course learning page
2. Click on a VIDEO lesson
3. Play the video

**Expected Result**:
- ✅ Video player loads
- ✅ Can play/pause
- ✅ Can adjust volume
- ✅ Can go fullscreen
- ✅ "Mark as Complete" button appears

---

### TC-018: Read Article Lesson
**Feature**: Article viewer  
**Steps**:
1. In course learning page
2. Click on an ARTICLE lesson
3. Read the content

**Expected Result**:
- ✅ Article content displays
- ✅ Formatted text, images, headings
- ✅ "Mark as Complete" button visible
- ✅ Read time estimate shown

---

### TC-019: Take Quiz
**Feature**: Quiz system  
**Steps**:
1. In course learning page
2. Click on a QUIZ lesson
3. Click "Start Quiz"
4. Answer all questions
5. Click "Submit Quiz"

**Expected Result**:
- ✅ Quiz loads with questions
- ✅ Timer starts (if time limit set)
- ✅ Can select answers
- ✅ Submit button enabled after all answered
- ✅ Score displayed after submission
- ✅ Pass/Fail message shown

---

### TC-020: Retake Quiz
**Feature**: Quiz retake  
**Steps**:
1. After completing a quiz
2. Click "Retake Quiz" button
3. Complete quiz again

**Expected Result**:
- ✅ Quiz resets to first question
- ✅ Previous answers cleared
- ✅ Can submit again
- ✅ New score recorded
- ✅ Best score kept

---

### TC-021: Mark Lesson Complete
**Feature**: Progress tracking  
**Steps**:
1. On any lesson (video/article)
2. Click "Mark as Complete" button
3. Go to next lesson

**Expected Result**:
- ✅ Lesson marked with checkmark
- ✅ Progress bar updates
- ✅ Next lesson opens automatically
- ✅ Dashboard progress updates

---

### TC-022: Track Course Progress
**Feature**: Progress percentage  
**Steps**:
1. Complete 3 out of 10 lessons
2. Go to Dashboard
3. Check course card

**Expected Result**:
- ✅ Progress bar shows 30%
- ✅ "3 of 10 lessons completed" text
- ✅ Status: "In Progress"

---

### TC-023: Complete Full Course
**Feature**: Course completion  
**Steps**:
1. Complete ALL lessons in a course
2. Go to Dashboard
3. Check course status

**Expected Result**:
- ✅ Progress bar shows 100%
- ✅ Status changes to "Completed"
- ✅ Completion date shown
- ✅ Badge or indicator appears

---

## ⭐ Reviews & Ratings

### TC-024: Submit Course Review
**Feature**: Course review system  
**Steps**:
1. Login as student
2. Enroll in a course (or use enrolled course)
3. Go to course detail page
4. Click "Reviews" tab
5. Select 5 stars
6. Write review: "Great course!"
7. Click "Submit Review"

**Expected Result**:
- ✅ Review submitted successfully
- ✅ Your review appears at top
- ✅ Can't submit another review (already reviewed)
- ✅ Course rating updates

---

### TC-025: Edit Review
**Feature**: Update existing review  
**Steps**:
1. On course with your review
2. Go to Reviews tab
3. Click "Edit" on your review
4. Change rating to 4 stars
5. Update text
6. Click "Update Review"

**Expected Result**:
- ✅ Review updated successfully
- ✅ New rating and text shown
- ✅ "Updated at" timestamp changes

---

### TC-026: Delete Review
**Feature**: Remove review  
**Steps**:
1. On course with your review
2. Go to Reviews tab
3. Click "Delete" on your review
4. Confirm deletion

**Expected Result**:
- ✅ Review deleted
- ✅ Can submit new review now
- ✅ Course rating recalculates

---

### TC-027: View All Reviews
**Feature**: Review pagination  
**Steps**:
1. Go to course with 10+ reviews
2. Click "Reviews" tab
3. Scroll to bottom
4. Click "Load More"

**Expected Result**:
- ✅ First 5 reviews shown
- ✅ Clicking "Load More" shows next 5
- ✅ Reviews sorted by date (newest first)
- ✅ Shows reviewer name, date, rating

---

## 🎬 Live Courses (NEW)

### TC-028: Create Live Course (Admin)
**Feature**: Live course creation  
**Steps**:
1. Login as ADMIN
2. Go to Admin Panel → Courses
3. Click "Create Course"
4. Select Type: "LIVE"
5. Fill in: Title, description, price
6. Set start date: (future date)
7. Set end date: (after start date)
8. Set session count: 5
9. Click "Save"

**Expected Result**:
- ✅ Live course created
- ✅ Appears in course list with "LIVE" badge
- ✅ "Sessions" and "Assignments" buttons visible

---

### TC-029: Add Live Session (Admin)
**Feature**: Session scheduling  
**Steps**:
1. Login as admin
2. Go to course list
3. Click "Sessions" button on a LIVE course
4. Click "Create Session"
5. Enter title: "Introduction to React"
6. Set scheduled date/time: (future)
7. Enter Zoom link: "https://zoom.us/j/123456789"
8. Set duration: 90 minutes
9. Click "Save"

**Expected Result**:
- ✅ Session created
- ✅ Appears in sessions list
- ✅ Status: "SCHEDULED"
- ✅ Shows date, time, duration

---

### TC-030: Upload Session Material (Admin)
**Feature**: Material upload  
**Steps**:
1. On sessions page
2. Click on a session
3. Click "Upload Material"
4. Select a PDF file
5. Enter title: "Lecture Slides"
6. Click "Upload"

**Expected Result**:
- ✅ File uploads to Cloudinary
- ✅ Material appears in session
- ✅ Shows file name, size, type
- ✅ Download link available

---

### TC-031: Update Session Status (Admin)
**Feature**: Session lifecycle  
**Steps**:
1. Find a scheduled session
2. Change status dropdown to "LIVE"
3. Save changes

**Expected Result**:
- ✅ Status updates to "LIVE"
- ✅ "Join Session" button becomes active
- ✅ Students can see it's live now

---

### TC-032: Create Assignment (Admin)
**Feature**: Assignment creation  
**Steps**:
1. Go to live course
2. Click "Assignments" button
3. Click "Create Assignment"
4. Enter title: "React Homework"
5. Set due date: (7 days from now)
6. Select allowed file types: PDF, DOCX
7. Set max file size: 10 MB
8. Set max grade: 100
9. Click "Save"

**Expected Result**:
- ✅ Assignment created
- ✅ Appears in assignments list
- ✅ Shows due date and file requirements

---

### TC-033: View Live Course Schedule (Student)
**Feature**: Student session view  
**Steps**:
1. Login as student
2. Enroll in a live course
3. Go to course detail page
4. Click "Go to Course"
5. Click "Schedule" tab

**Expected Result**:
- ✅ All sessions listed
- ✅ Upcoming sessions show "Starting Soon"
- ✅ Past sessions show "Completed"
- ✅ Can see Zoom links for upcoming/live sessions
- ✅ Can download materials

---

### TC-034: Join Live Session (Student)
**Feature**: Zoom integration  
**Steps**:
1. On schedule tab
2. Find a session with status "LIVE"
3. Click "Join Live Session" button

**Expected Result**:
- ✅ New tab opens
- ✅ Redirects to Zoom meeting
- ✅ Can join the session

---

### TC-035: Submit Assignment (Student)
**Feature**: Assignment submission  
**Steps**:
1. In live course view
2. Click "Assignments" tab
3. Find an assignment
4. Click "Choose File"
5. Select a PDF file (within size limit)
6. Click "Submit"

**Expected Result**:
- ✅ File uploads successfully
- ✅ Status changes to "Submitted"
- ✅ Submission date shown
- ✅ Can see uploaded file name

---

### TC-036: Late Assignment Submission (Student)
**Feature**: Late detection  
**Steps**:
1. Wait until assignment due date passes
2. Submit assignment after due date
3. Check submission status

**Expected Result**:
- ✅ Can still submit (allowed)
- ✅ Shows "LATE" badge
- ✅ Shows "X days late" message
- ✅ Warning message during submission

---

### TC-037: Grade Assignment (Admin)
**Feature**: Grading system  
**Steps**:
1. Login as admin
2. Go to assignment editor
3. Click "Grading" section
4. Find a submitted assignment
5. Click "Grade"
6. Enter score: 85
7. Enter feedback: "Good work!"
8. Click "Save Grade"

**Expected Result**:
- ✅ Grade saved
- ✅ Status changes to "GRADED"
- ✅ Student can see grade
- ✅ Shows percentage: 85/100

---

### TC-038: View Assignment Grade (Student)
**Feature**: Grade visibility  
**Steps**:
1. After admin grades your assignment
2. Go to assignments tab
3. Check graded assignment

**Expected Result**:
- ✅ Grade displayed: "85/100"
- ✅ Percentage shown: "85%"
- ✅ Feedback text visible
- ✅ Status badge: "GRADED"

---

### TC-039: Download Session Material (Student)
**Feature**: Material access  
**Steps**:
1. In live course schedule
2. Find session with materials
3. Click "Download" on a material

**Expected Result**:
- ✅ File downloads from Cloudinary
- ✅ Correct file name
- ✅ File opens correctly

---

## 🖼️ Media Upload (Cloudinary)

### TC-040: Upload Course Image (Admin)
**Feature**: Course image upload  
**Steps**:
1. Login as admin
2. Go to course editor (edit existing course)
3. Click "Choose Image"
4. Select a JPG/PNG file (< 5MB)
5. Preview image
6. Click "Upload Image"

**Expected Result**:
- ✅ Image uploads to Cloudinary
- ✅ Preview updates immediately
- ✅ Image URL saved to course
- ✅ Image appears on course cards

---

### TC-041: Replace Course Image (Admin)
**Feature**: Update course image  
**Steps**:
1. On course with existing image
2. Click "Change Image"
3. Select new image
4. Click "Upload Image"

**Expected Result**:
- ✅ Old image replaced
- ✅ New image displays
- ✅ Course cards update
- ✅ CDN URL changes

---

### TC-042: Remove Course Image (Admin)
**Feature**: Delete course image  
**Steps**:
1. On course with image
2. Click "Remove Image" (X button)
3. Save course

**Expected Result**:
- ✅ Image removed
- ✅ Placeholder shown instead
- ✅ No broken image links

---

## 🛠️ Admin Panel

### TC-043: View Admin Dashboard
**Feature**: Admin overview  
**Steps**:
1. Login as ADMIN
2. Click "Admin Panel" in header
3. Review dashboard

**Expected Result**:
- ✅ Stats cards: Users, Courses, Revenue, Enrollments
- ✅ Recent orders list
- ✅ Charts/graphs visible
- ✅ All numbers accurate

---

### TC-044: Create Course (Admin)
**Feature**: Course creation  
**Steps**:
1. Admin Panel → Courses
2. Click "Create Course"
3. Fill all required fields
4. Click "Save"

**Expected Result**:
- ✅ Course created
- ✅ Appears in courses list
- ✅ Status: Unpublished (draft)

---

### TC-045: Edit Course (Admin)
**Feature**: Course editing  
**Steps**:
1. In courses list
2. Click "Edit" on a course
3. Change title
4. Click "Save"

**Expected Result**:
- ✅ Changes saved
- ✅ Updated title shows everywhere

---

### TC-046: Delete Course (Admin)
**Feature**: Course deletion  
**Steps**:
1. Find course with NO orders
2. Click "Delete" button
3. Confirm deletion

**Expected Result**:
- ✅ Course deleted
- ✅ Removed from list
- ✅ Cannot delete if has orders

---

### TC-047: Publish/Unpublish Course (Admin)
**Feature**: Course visibility  
**Steps**:
1. Find unpublished course
2. Click toggle to "Publish"
3. Check public courses page

**Expected Result**:
- ✅ Status changes to "Published"
- ✅ Course visible to students
- ✅ Appears in catalog

---

### TC-048: Add Curriculum Section (Admin)
**Feature**: Curriculum builder  
**Steps**:
1. Edit course → Curriculum tab
2. Click "Add Section"
3. Enter title: "Getting Started"
4. Click "Save"

**Expected Result**:
- ✅ Section created
- ✅ Shows in curriculum
- ✅ Can add lessons to it

---

### TC-049: Add Video Lesson (Admin)
**Feature**: Lesson creation  
**Steps**:
1. In a section
2. Click "Add Lesson"
3. Select type: VIDEO
4. Enter title: "Introduction"
5. Enter video URL (YouTube)
6. Set duration: 15 minutes
7. Click "Save"

**Expected Result**:
- ✅ Lesson created
- ✅ Shows video icon
- ✅ Duration displayed

---

### TC-050: Create Quiz (Admin)
**Feature**: Quiz builder  
**Steps**:
1. Add lesson → Type: QUIZ
2. Enter quiz title
3. Click "Create Quiz"
4. Click "Add Question"
5. Enter question: "What is React?"
6. Select type: Multiple Choice
7. Add 4 options
8. Mark correct answer
9. Set points: 10
10. Click "Save"

**Expected Result**:
- ✅ Quiz created
- ✅ Question saved
- ✅ Correct answer marked
- ✅ Points assigned

---

### TC-051: Create Article (Admin)
**Feature**: Article editor  
**Steps**:
1. Add lesson → Type: ARTICLE
2. Enter title
3. Open TinyMCE editor
4. Type formatted text
5. Add heading, bold, list
6. Click "Save"

**Expected Result**:
- ✅ Article saved
- ✅ Formatting preserved
- ✅ Displays correctly to students

---

### TC-052: Reorder Curriculum (Admin)
**Feature**: Drag-drop reorder  
**Steps**:
1. In curriculum editor
2. Drag a section up/down
3. Save changes

**Expected Result**:
- ✅ Order updates
- ✅ Students see new order
- ✅ Numbers update automatically

---

### TC-053: View All Users (Admin)
**Feature**: User management  
**Steps**:
1. Admin Panel → Users
2. Review user list
3. Search for a user

**Expected Result**:
- ✅ All users displayed
- ✅ Shows name, email, roles
- ✅ Search works
- ✅ Can filter by role

---

### TC-054: Block User (Admin)
**Feature**: User blocking  
**Steps**:
1. Find a user
2. Click "Block" button
3. Try to login as that user

**Expected Result**:
- ✅ User status: Blocked
- ✅ Cannot login anymore
- ✅ Gets error message

---

### TC-055: Assign Admin Role (Admin)
**Feature**: Role management  
**Steps**:
1. Find a regular user
2. Click "Manage Roles"
3. Check "ADMIN" role
4. Click "Save"

**Expected Result**:
- ✅ User becomes admin
- ✅ Can access Admin Panel
- ✅ Shows "ADMIN" badge

---

### TC-056: View All Orders (Admin)
**Feature**: Order management  
**Steps**:
1. Admin Panel → Orders
2. Review order list
3. Filter by status: "COMPLETED"

**Expected Result**:
- ✅ All orders shown
- ✅ Shows date, user, amount
- ✅ Filter works
- ✅ Can view order details

---

### TC-057: Refund Order (Admin)
**Feature**: Order refund  
**Steps**:
1. Find a completed order
2. Click "Refund" button
3. Confirm refund

**Expected Result**:
- ✅ Order status: "REFUNDED"
- ✅ Student loses course access
- ✅ Enrollment removed

---

## 🏠 Homepage & Navigation

### TC-058: View Featured Courses
**Feature**: Homepage featured section  
**Steps**:
1. Go to homepage
2. Scroll to "Featured Courses"

**Expected Result**:
- ✅ 3 featured courses displayed
- ✅ Shows course cards
- ✅ "View All Courses" link works

---

### TC-059: View Upcoming Live Courses
**Feature**: Live courses section  
**Steps**:
1. On homepage
2. Scroll to "Upcoming Live Courses"

**Expected Result**:
- ✅ Shows live courses only
- ✅ Displays start dates
- ✅ "LIVE" badge visible
- ✅ "View All Live Courses" link works

---

### TC-060: Navigate Using Header
**Feature**: Main navigation  
**Steps**:
1. Click each menu item:
   - Home
   - Courses
   - Dashboard
   - Admin Panel (if admin)

**Expected Result**:
- ✅ All links work
- ✅ Active page highlighted
- ✅ Smooth navigation

---

## 🐛 Error Handling

### TC-061: Access Protected Route Logged Out
**Feature**: Auth guard  
**Steps**:
1. Logout
2. Try to access: /dashboard
3. Or try: /admin

**Expected Result**:
- ✅ Redirected to login page
- ✅ Error message: "Please login"

---

### TC-062: Upload Invalid File Type
**Feature**: File validation  
**Steps**:
1. Try to upload .exe file as course image
2. Or upload 100MB file

**Expected Result**:
- ✅ Error message shown
- ✅ Upload blocked
- ✅ Clear error explanation

---

### TC-063: Submit Empty Form
**Feature**: Form validation  
**Steps**:
1. Try to create course with empty title
2. Click "Save"

**Expected Result**:
- ✅ Validation error shown
- ✅ Form not submitted
- ✅ Field highlighted in red

---

### TC-064: Handle Network Error
**Feature**: API error handling  
**Steps**:
1. Turn off Wi-Fi
2. Try to load courses page

**Expected Result**:
- ✅ Error message displayed
- ✅ No crash
- ✅ Can retry when back online

---

## 📱 Cross-Browser Testing

### TC-065: Test in Chrome
**Feature**: Chrome compatibility  
**Steps**:
1. Open site in Chrome
2. Test key features (login, enroll, quiz)

**Expected Result**:
- ✅ All features work
- ✅ No console errors
- ✅ UI looks correct

---

### TC-066: Test in Edge
**Feature**: Edge compatibility  
**Steps**:
1. Open site in Edge
2. Test key features

**Expected Result**:
- ✅ All features work
- ✅ No layout issues

---

### TC-067: Test in Firefox
**Feature**: Firefox compatibility  
**Steps**:
1. Open site in Firefox
2. Test key features

**Expected Result**:
- ✅ All features work
- ✅ No JS errors

---

## 🎯 Performance Testing

### TC-068: Page Load Speed
**Feature**: Performance  
**Steps**:
1. Clear browser cache
2. Load homepage
3. Check load time (Network tab)

**Expected Result**:
- ✅ Homepage loads < 3 seconds
- ✅ No 404 errors
- ✅ All images load

---

### TC-069: Search Performance
**Feature**: Search responsiveness  
**Steps**:
1. Go to courses page (50+ courses)
2. Type quickly in search box
3. Observe response time

**Expected Result**:
- ✅ Results update instantly
- ✅ No lag or freeze
- ✅ Smooth typing experience

---

## 📊 Test Summary Report Template

After testing, fill this out:

```
TEST EXECUTION SUMMARY
Date: [Date]
Tester: [Your Name]
Environment: Production / Staging

RESULTS:
- Total Test Cases: 69
- Passed: ___
- Failed: ___
- Blocked: ___
- Skipped: ___

FAILED TEST CASES:
TC-XXX: [Description]
- Issue: [What went wrong]
- Priority: High/Medium/Low

BLOCKERS:
- [List any issues preventing testing]

NOTES:
- [Any observations or concerns]
```

---

## 🚨 Critical Path Tests (Run These First)

**Priority 1** - Must work:
- TC-002: User Login
- TC-012: Enroll in Free Course
- TC-016: Start Course
- TC-019: Take Quiz
- TC-024: Submit Review

**Priority 2** - Core features:
- TC-013: Add to Cart
- TC-015: Checkout
- TC-028: Create Live Course
- TC-035: Submit Assignment

---

## 💡 Testing Tips

1. **Test with fresh data** - Create new accounts for each test cycle
2. **Take screenshots** - Capture any bugs you find
3. **Note timestamps** - Record when issues occur
4. **Clear cache** - Between test runs
5. **Test both roles** - Student AND admin
6. **Try edge cases** - Empty fields, special characters, large files
7. **Check console** - F12 → Console tab for errors
8. **Test happy path first** - Then try to break it

---

## 📝 Bug Report Template

When you find a bug, report it like this:

```
BUG REPORT

Title: [Short description]
Test Case: TC-XXX
Severity: Critical / High / Medium / Low

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Environment:
- Browser: Chrome 120
- OS: Windows 11
- URL: https://codeless.digital/...

Screenshots:
[Attach screenshots]

Console Errors:
[Copy any errors from console]
```

---

**🎉 Happy Testing!**  
Questions? Ask your team lead.

