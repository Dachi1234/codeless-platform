# 🐛 Current Bugs & Issues

**Last Updated**: October 14, 2025  
**Status**: Active Bug Tracking  
**Total Issues**: 19 (17 original + 2 hotfixes)  
**Fixed**: 17 | **Remaining**: 2

---

## ⚡ **Performance Issues**

### Multiple API Requests on Courses Page
**Location**: Courses Page  
**Issue**: When loading the courses page, the frontend makes 3 identical requests to `/api/courses` instead of 1. This is caused by Angular FormsModule triggering `ngModelChange` events during component initialization for each of the 5 form controls (search, category, level, type, sort).  
**Impact**: Medium - Performance/efficiency  
**Status**: 🟡 Under Investigation  
**Attempted Solutions**: 
- Added initialization guard with `setTimeout` delay
- Implemented early return during init phase
- Multiple approaches tried but FormsModule fires synchronously before guards activate
**Next Steps**: Consider alternative approaches (debouncing, RxJS, or refactoring filter logic)

---

## 🔴 **High Priority**

### 1. Cart without Login - Cart Persistence Issue ✅ **FIXED**
**Location**: Cart System  
**Issue**: If the user is not logged in, they should be able to add courses to the cart. After they log in, their cart with the content should be visible in their profile.  
**Impact**: High - Affects conversion rate  
**Status**: ✅ **Fixed** - October 13, 2025  
**Solution**: 
- Added guest cart functionality using localStorage
- Implemented automatic merge of guest cart with user cart on login
- Added backend endpoints for guest cart details and merging
- Cart now works seamlessly for both guest and authenticated users

### 2. Sign Up - Email Already Exists Error Message ✅ **FIXED**
**Location**: Sign Up Page  
**Issue**: When user tries to sign up with an email that already exists in the system, the message should be changed and should tell that the user with this email already exists (if this does not violate the privacy of the other users, otherwise just tell the user to try with a new email).  
**Impact**: High - User experience  
**Status**: ✅ **Fixed** - October 13, 2025  
**Solution**: Updated backend AuthService to check for existing email and throw ConflictException with clear message: "An account with this email already exists. Please try logging in or use a different email address."


---

## 🟡 **Medium Priority**

### 4. "Codeless" Logo as Home Button ✅ **FIXED**
**Location**: Header Navigation  
**Issue**: If the user is not logged in and clicks on "Codeless", it should always work as Home Button would.  
**Impact**: Medium - Navigation UX  
**Status**: ✅ **Already Working** - October 13, 2025

### 5. "Home" Button Scroll Behavior ✅ **FIXED**
**Location**: Header Navigation  
**Issue**: If the user is not logged in and has scrolled down the home page, when they click on home button, the homepage should scroll up to the beginning.  
**Impact**: Medium - Navigation UX  
**Status**: ✅ **Fixed** - October 13, 2025  
**Solution**: Added `goToHome()` method in AppComponent that detects if user is already on home page and scrolls to top with smooth behavior. Applied to both desktop and mobile navigation, plus the Codeless logo.

### 6. Course Categories without Login ✅ **FIXED**
**Location**: Courses Page > All Categories Filter  
**Issue**: When user is not logged in > Courses Page > All Categories should show all course categories there are.  
**Impact**: Medium - Filter functionality  
**Status**: ✅ **Fixed** - October 14, 2025  
**Solution**:
- Added `findDistinctCategories()` method to `CourseRepository` to query distinct categories from published courses
- Created `/api/courses/categories` endpoint in backend
- Updated frontend to fetch categories dynamically via `CourseService.getCategories()`
- Categories dropdown now shows actual categories from database instead of hardcoded values

### 7. Course Counter Issue ✅ **FIXED**
**Location**: Courses Page  
**Issue**: User is not Logged In > Courses > The amount of courses should be counted correctly.  
**Impact**: Medium - Display accuracy  
**Status**: ✅ **Fixed** - October 14, 2025  
**Solution**:
- Updated `CourseService.list()` to return full `PageResponse` instead of just course array
- Modified `CoursesComponent` to extract `totalElements` and `content.length` from response
- Course counter now dynamically shows actual count: "Showing X of Y courses"
- Counts update correctly when filters are applied

### 8. Course Sorting vs Filters Visual Differentiation ✅ **FIXED**
**Location**: Courses Page  
**Issue**: Course Sorting should be visually different from Filters.  
**Impact**: Medium - UI/UX clarity  
**Status**: ✅ **Fixed** - October 14, 2025  
**Solution**:
- Wrapped sort dropdown in a distinct `.sort-wrapper` container
- Added blue gradient background with border to differentiate from filters
- Added sort icon (horizontal lines) before the dropdown
- Added "Sort:" label for clarity
- Custom styled select with transparent background and blue-themed colors
- Hover effects with shadow and color transitions
- Visual hierarchy now clear: filters are neutral, sort is highlighted in blue

### 9. Course Sorting with Popularity ✅ **FIXED**
**Location**: Courses Page > Sort Options  
**Issue**: Course Sorting with Popularity should sort according to rating score.  
**Impact**: Medium - Sorting accuracy  
**Status**: ✅ **Fixed** - October 13, 2025  
**Solution**: 
- **Frontend**: Updated `mapSort()` function to send `rating,desc` when "Most Popular" is selected
- **Backend**: Implemented custom sorting with `COALESCE` to handle null ratings, ensuring courses without ratings appear last
- Courses now sort correctly: highest rated first, courses without ratings at the end
- **Note**: See "Performance Issues" section regarding multiple API requests (not a bug in sorting logic)

### 10. Course Details > Syllabus Display
**Location**: Course Details Page > Syllabus Tab  
**Issue**: Should show all the details filled in the curriculum from the Admin Panel - Description, Lessons, Lesson Types etc.  
**Impact**: Medium - Information display  
**Status**: 🟡 Open

### 11. Filter "x" Button ✅ **FIXED**
**Location**: Courses Page > Filters  
**Issue**: Each Filter should have "x" button to remove the filter the user used.  
**Impact**: Medium - Filter UX  
**Status**: ✅ **Fixed** - October 14, 2025  
**Solution**:
- Added `clearFilter()` method to `CoursesComponent` that clears specific filter types
- Wrapped filter dropdowns in `.filter-with-clear` containers
- Added clear button ("x" icon) that appears when a filter is active
- Buttons positioned absolutely within filter containers with hover effects
- Clear buttons appear for: search, category, level, and type filters
- Clicking clear button removes filter and refreshes course list

### 12. Price Low to High Sorting ✅ **VERIFIED**
**Location**: Courses Page > Sort Options  
**Issue**: "Price Low to High" should first show free courses and then sort other courses according to price rise.  
**Impact**: Medium - Sorting logic  
**Status**: ✅ **Verified Working** - October 13, 2025  
**Solution**: The existing `price,asc` sorting already works correctly - it naturally puts free courses (price = 0.00) first, then sorts remaining courses by ascending price (e.g., 0.00, 0.00, 49.99, 59.99, etc.).

### 13. Login > Remember Me Functionality ✅ **FIXED**
**Location**: Login Page  
**Issue**: If the user does not tick that before logging in, they should not be remembered by the system. This tick should work as it should.  
**Impact**: Medium - Auth functionality  
**Status**: ✅ **Fixed** - October 14, 2025  
**Solution**:
- **Backend**: Added rememberMe parameter to login endpoint, generates JWT with different expiration times
- **JWT Expiration**: 4 hours (default) vs 14 days (with rememberMe)
- **Frontend**: Login form sends rememberMe flag, stores token accordingly
- **Storage Strategy**: 
  - WITHOUT "Remember Me": Token in sessionStorage (cleared when browser closes), 4 hours
  - WITH "Remember Me": Token in localStorage (persists across sessions), 14 days
- Updated AuthService to check both storage types on bootstrap
- Added clear console logging for debugging ("Remember Me: ON/OFF")

### 14. My Course > Continue Learning - Current Lesson Indicator ✅ **FIXED**
**Location**: Course Learning Page  
**Issue**: It should show visually on which lesson is currently the user standing.  
**Impact**: Medium - Learning UX  
**Status**: ✅ **Fixed** - October 14, 2025  
**Solution**:
- Enhanced `.active` class styling in course-learn component
- **Visual Indicators**:
  - Blue gradient background (linear-gradient from #EEF2FF to #F5F8FF)
  - Thicker left border (4px solid #5A8DEE)
  - Inset shadow for depth effect
  - Animated play icon (triangle) that pulses subtly
  - Bold blue text for lesson title and duration
  - Blue-tinted checkbox border
- **Animation**: Smooth pulse effect on play indicator (2s cycle)
- Makes current lesson VERY obvious at a glance

---

## 🔥 **Critical Hotfixes**

### 18. Checkout Page Empty Cart ✅ **FIXED**
**Location**: Checkout Page  
**Issue**: After clicking "Proceed to Checkout", the checkout page showed "Your cart is empty" despite items being in the cart.  
**Impact**: Critical - Blocks purchase flow  
**Status**: ✅ **Fixed** - October 14, 2025  
**Root Cause**: Checkout component still using old HTTP-based cart loading instead of reactive signals after CartService refactor  
**Solution**:
- Migrated checkout component to use computed signals from CartService
- `cartItems = computed(() => this.cartService.getCartItems())`
- Updated all template references from `cartItems` to `cartItems()`
- Removed unnecessary HTTP call in `ngOnInit()`
- Cart now displays correctly on checkout page

### 19. Filters Overlapping on Courses Page ✅ **FIXED**
**Location**: Courses Page > Filter Bar  
**Issue**: Category filter overlapping with Level and Type filters, especially with long category names.  
**Impact**: High - Poor UX, hard to use filters  
**Status**: ✅ **Fixed** - October 14, 2025  
**Root Cause**: Rigid CSS Grid layout couldn't handle varying content widths  
**Solution**:
- Changed from CSS Grid to Flexbox with wrapping
- Increased gap spacing from 12px to 16px
- Search input: flexible width (300px min, can grow)
- Filters: fixed width (200-220px, won't shrink with flex-shrink: 0)
- Added responsive breakpoints:
  - **< 1200px**: Search takes full width on separate row
  - **< 640px**: All filters stack vertically
- Prevents overlapping with proper spacing and text-overflow: ellipsis

---

## 🟢 **Low Priority**

### 15. Remove Course from Cart - Confirmation Popup ✅ **FIXED**
**Location**: Cart Page  
**Issue**: When the user removes the course from the cart, the popup window should ask if the user is sure. If the user says that they are sure, the course should be removed from the cart; if they cancel the action, course should stay in the cart.  
**Impact**: Low - UX improvement  
**Status**: ✅ **Fixed** - October 14, 2025  
**Solution**:
- Added elegant modal confirmation dialog when removing items
- Modal shows course name and warning icon with pulse animation
- Two buttons: "Cancel" (gray) and "Remove Item" (red gradient)
- Smooth animations: fadeIn for overlay, slideUp for modal
- Backdrop blur effect for professional look
- Click outside modal or Cancel button closes without removing
- Prevents accidental deletions and improves UX

### 16. Sign Up - Terms and Service Checkbox ✅ **FIXED**
**Location**: Sign Up Page  
**Issue**: When user is not in Terms and Service box and clicks sign up, popup should tell that user must tick the box to sign up.  
**Impact**: Low - Validation message  
**Status**: ✅ **Fixed** - October 14, 2025  
**Solution**:
- Added validation check in `onSubmit()` method before processing registration
- Shows clear error message: "You must agree to the Terms of Service and Privacy Policy to create an account."
- Error appears in the same error message area as other validation errors
- Prevents form submission until checkbox is checked
- Error automatically clears when user checks the Terms checkbox
- Removed `!acceptedTerms` from button disabled condition to allow validation feedback
- Improves clarity for users about registration requirements

### 17. Cart Icon Update ✅ **FIXED**
**Location**: Header Navigation  
**Issue**: Cart Icon should be changed with an actual cart icon.  
**Impact**: Low - Visual polish  
**Status**: ✅ **Fixed** - October 14, 2025  
**Solution**:
- Replaced shopping bag icon with proper shopping cart SVG
- New icon features cart body shape with handle
- Added two wheels (circles) at the bottom for authentic cart appearance
- Maintains same size (24x24) and styling for consistency
- Cart badge positioning unchanged

---

## 📊 **Summary by Category**

| Category | Count | Fixed |
|----------|-------|-------|
| Cart & Checkout | 4 | 4 ✅ |
| Navigation & UI | 5 | 4 ✅ |
| Course Filtering & Sorting | 5 | 5 ✅ |
| Authentication | 2 | 2 ✅ |
| Admin Panel | 1 | 0 |
| Learning Experience | 2 | 2 ✅ |
| Performance | 1 | 0 (investigating) |

---

## 📋 **Bug Status Legend**

- 🔴 **High Priority** - Critical for user experience or functionality
- 🟡 **Medium Priority** - Important but not blocking
- 🟢 **Low Priority** - Nice to have, polish items

---

## 🔄 **Recommended Next Steps**

### Remaining Issues (2 total):
1. **Bug #10**: Syllabus Display - Show full curriculum details in course detail page (Medium priority, skipped for now per user request)
2. **Multiple API Requests Issue** - Refactor CoursesComponent to eliminate duplicate requests (Performance optimization)

---

## 🎉 **Completed Categories**

✅ **Course Filtering & Sorting** - 5/5 bugs fixed (100%)  
✅ **Cart & Checkout** - 4/4 bugs fixed (100%)  
✅ **Authentication** - 2/2 bugs fixed (100%)  
✅ **Learning Experience** - 2/2 bugs fixed (100%)  
✅ **Navigation & UI** - 4/5 bugs fixed (80%)

---

## 📝 **How to Update This Document**

When a bug is fixed:
1. Change status from 🔴/🟡/🟢 Open to ✅ Fixed
2. Add fix date and PR/commit reference
3. Move to archived section at bottom
4. Update total count

---

**Last Reviewed**: October 14, 2025  
**Next Review**: Check weekly during sprint planning

---

## 📈 **Progress Summary**

### Session Highlights (October 13-14, 2025):
- ✅ Fixed 2 high-priority bugs (guest cart, email validation)
- ✅ Fixed 9 medium-priority bugs (home scroll, popularity sort, dynamic categories, course counter, filter clear buttons, sort visual diff, cart icon, remember me, lesson indicator)
- ✅ Fixed 2 low-priority bugs (cart confirmation, terms validation)
- ✅ Fixed 2 critical hotfixes (checkout empty cart, filters overlapping)
- ✅ Verified 2 bugs already working (logo navigation, price sort)
- 🟡 Identified performance issue (multiple API requests)
- **Total Progress**: 17 bugs resolved/verified out of 19 (89% complete!) 🎉

### Remaining Work:
- 2 open items (1 skipped feature, 1 performance optimization)
- **5 COMPLETE CATEGORIES! ✅**
- **All Course Filtering & Sorting bugs COMPLETE! ✅**
- **All Cart & Checkout bugs COMPLETE! ✅**
- **All Authentication bugs COMPLETE! ✅**
- **All Learning Experience bugs COMPLETE! ✅**
- **Navigation & UI**: 4/5 bugs fixed (80%)

