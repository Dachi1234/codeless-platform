# 📋 Product Backlog

**Last Updated**: October 10, 2025

---

## 🎯 Current Priorities

See [`PRIORITY_ROADMAP.md`](./PRIORITY_ROADMAP.md) for the prioritized action plan.

---

## ✅ Completed Features

### **Core Platform**
- [x] User authentication (registration, login, JWT)
- [x] Course catalog (browse, search, filter, sort)
- [x] Course detail page with real data (overview, syllabus)
- [x] Shopping cart system
- [x] Checkout & PayPal integration (sandbox)
- [x] Enrollment system
- [x] Student dashboard with progress tracking
- [x] Course learning page (video, article, quiz)
- [x] Profile management (edit name, avatar)

### **Content Management**
- [x] Curriculum builder (sections, lessons)
- [x] Article editor (TinyMCE)
- [x] Quiz builder (4 question types)
- [x] Video player integration (Plyr)

### **Admin Panel**
- [x] Course management (CRUD, publish/unpublish)
- [x] Curriculum management
- [x] Quiz management
- [x] User management
- [x] Order management
- [x] Enrollment management
- [x] Analytics dashboard

### **Progress Tracking**
- [x] Lesson-level progress
- [x] Course-level progress
- [x] Time tracking
- [x] Resume functionality (video position)
- [x] Dashboard integration

---

## 🔥 High Priority (Next 2 Weeks)

### **Exercise Builder**
**Status**: ⏳ Not started  
**Description**: Code challenge editor with test cases and auto-grading.

**Features**:
- [ ] Code editor (Monaco/CodeMirror)
- [ ] Language support (JavaScript, Python, Java)
- [ ] Test case management
- [ ] Code execution environment (sandboxed)
- [ ] Hint system
- [ ] Solution reveal (after attempts)
- [ ] Syntax highlighting
- [ ] Auto-save
- [ ] Submission history

**Estimated Effort**: 2-3 weeks  
**Dependencies**: None

---

### **Certificate Generation**
**Status**: ⏳ Not started  
**Description**: PDF certificates on course completion.

**Features**:
- [ ] Certificate template design
- [ ] PDF generation (iText/PDFKit)
- [ ] Student name, course title, completion date
- [ ] Unique verification code
- [ ] Download button in dashboard
- [ ] Email delivery
- [ ] Certificate verification page (public)

**Estimated Effort**: 1 week  
**Dependencies**: Email service

---

### **Email Service**
**Status**: ⏳ Not started  
**Description**: Transactional emails for user actions.

**Features**:
- [ ] Welcome email on registration
- [ ] Password reset emails
- [ ] Enrollment confirmation
- [ ] Purchase receipt
- [ ] Course completion congratulations
- [ ] Certificate delivery
- [ ] Admin notifications (new orders, support)

**Provider Options**: SendGrid, Mailgun, AWS SES  
**Estimated Effort**: 1 week

---

### **Media Upload (Cloudinary)**
**Status**: ⏳ Not started  
**Description**: Upload images and videos to Cloudinary.

**Features**:
- [ ] Image upload (course thumbnails, profile pictures)
- [ ] Video upload (for self-hosted content)
- [ ] Progress bar during upload
- [ ] Drag-and-drop interface
- [ ] Image optimization (auto-resize, compress)
- [ ] Video transcoding
- [ ] CDN delivery

**Estimated Effort**: 1 week

---

## 📌 Medium Priority (Next Month)

### **Course Reviews & Ratings**
- [ ] Star rating system (1-5 stars)
- [ ] Written reviews
- [ ] Review moderation (admin approval)
- [ ] Average rating calculation
- [ ] Sort/filter courses by rating
- [ ] Display reviews on course detail page
- [ ] "Verified purchase" badge

**Estimated Effort**: 1-2 weeks

---

### **Discussion Forum**
- [ ] Q&A per lesson
- [ ] Threaded discussions
- [ ] Instructor responses (highlighted)
- [ ] Upvote/downvote
- [ ] Mark as answered
- [ ] Notifications on new replies
- [ ] Search discussions

**Estimated Effort**: 2-3 weeks

---

### **Coupons & Discounts**
- [ ] Create discount codes (admin)
- [ ] Percentage or fixed amount
- [ ] Expiration dates
- [ ] Usage limits (total and per-user)
- [ ] Apply at checkout
- [ ] Track redemptions
- [ ] Bulk course discounts

**Estimated Effort**: 1 week

---

### **Google Analytics Integration**
- [ ] Page view tracking
- [ ] Event tracking (enrollment, purchase, completion)
- [ ] Conversion funnels
- [ ] User demographics
- [ ] Traffic sources

**Estimated Effort**: 2-3 days

---

## 🔮 Low Priority (Future)

### **Mobile App**
- [ ] React Native or Flutter app
- [ ] Offline video download
- [ ] Push notifications
- [ ] Mobile-optimized UI

**Estimated Effort**: 2-3 months

---

### **Live Sessions (Zoom Integration)**
- [ ] Schedule live sessions
- [ ] Zoom/WebRTC integration
- [ ] Attendance tracking
- [ ] Recording access
- [ ] Q&A during session

**Estimated Effort**: 3-4 weeks

---

### **Gamification**
- [ ] Achievement badges
- [ ] Streak tracking (daily login)
- [ ] Leaderboards
- [ ] Points system
- [ ] Levels (Beginner, Intermediate, Expert)

**Estimated Effort**: 2-3 weeks

---

### **Course Bundles**
- [ ] Create course bundles (package deals)
- [ ] Bundle pricing (discount vs individual)
- [ ] Bundle enrollment (all courses at once)

**Estimated Effort**: 1 week

---

### **Wishlist**
- [ ] Add courses to wishlist
- [ ] Wishlist page
- [ ] Email notifications on price drops

**Estimated Effort**: 3-5 days

---

### **Social Sharing**
- [ ] Share courses on social media
- [ ] Share achievements (certificates, completions)
- [ ] Referral links

**Estimated Effort**: 3-5 days

---

### **In-App Notifications**
- [ ] Notification bell icon
- [ ] Notification list
- [ ] Mark as read
- [ ] Types: new course, enrollment, completion, forum reply

**Estimated Effort**: 1 week

---

## 🐛 Known Bugs & Technical Debt

### **High Priority**
- [ ] Responsive design (mobile layout issues)
- [ ] PayPal webhook verification (security risk for real payments)
- [ ] Render cold start delay (10-15s after inactivity)

### **Medium Priority**
- [ ] Full-text search (PostgreSQL FTS not implemented)
- [ ] Rate limiting (prevent API abuse)
- [ ] Error monitoring (Sentry integration)

### **Low Priority**
- [ ] TinyMCE API key in code (acceptable for now, domain-restricted)
- [ ] No question bank for quiz reuse
- [ ] No drag-and-drop for curriculum reordering (buttons work)

---

## 📊 Backlog Statistics

- **Completed**: 60+ features
- **High Priority**: 4 features
- **Medium Priority**: 5 features
- **Low Priority**: 7 features
- **Bugs/Tech Debt**: 8 items

**Estimated Total Effort**: 3-4 months for all high & medium priority items

---

**📋 Backlog is living document - updated weekly!**

