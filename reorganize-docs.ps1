# Documentation Reorganization Script
# Run this to automatically organize all MD files

Write-Host "`n📁 Starting Documentation Reorganization..." -ForegroundColor Cyan
Write-Host "This will move files to the new docs/ structure`n" -ForegroundColor Cyan

# Step 1: Setup documentation
Write-Host "Step 1: Moving setup documentation..." -ForegroundColor Green
if (Test-Path "SETUP_INSTRUCTIONS.md") {
    Move-Item "SETUP_INSTRUCTIONS.md" "docs\setup\" -Force
    Write-Host "  ✓ Moved SETUP_INSTRUCTIONS.md" -ForegroundColor Gray
}
if (Test-Path "DEPLOYMENT_GUIDE.md") {
    Move-Item "DEPLOYMENT_GUIDE.md" "docs\setup\" -Force
    Write-Host "  ✓ Moved DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
}

# Step 2: Architecture documentation
Write-Host "`nStep 2: Moving architecture documentation..." -ForegroundColor Green
if (Test-Path "SECURITY_AUDIT_REPORT.md") {
    Move-Item "SECURITY_AUDIT_REPORT.md" "docs\architecture\" -Force
    Write-Host "  ✓ Moved SECURITY_AUDIT_REPORT.md" -ForegroundColor Gray
}

# Step 3: Feature documentation
Write-Host "`nStep 3: Moving feature documentation..." -ForegroundColor Green
if (Test-Path "ARTICLE_BUILDER_COMPLETE.md") {
    Move-Item "ARTICLE_BUILDER_COMPLETE.md" "docs\features\ARTICLE_BUILDER.md" -Force
    Write-Host "  ✓ Moved ARTICLE_BUILDER_COMPLETE.md" -ForegroundColor Gray
}
if (Test-Path "ADMIN_PANEL_COMPLETE.md") {
    Move-Item "ADMIN_PANEL_COMPLETE.md" "docs\features\ADMIN_PANEL.md" -Force
    Write-Host "  ✓ Moved ADMIN_PANEL_COMPLETE.md" -ForegroundColor Gray
}

# Step 4: Planning documentation
Write-Host "`nStep 4: Moving planning documentation..." -ForegroundColor Green
if (Test-Path "PRIORITY_ROADMAP.md") {
    Move-Item "PRIORITY_ROADMAP.md" "docs\planning\" -Force
    Write-Host "  ✓ Moved PRIORITY_ROADMAP.md" -ForegroundColor Gray
}

# Step 5: Update logs
Write-Host "`nStep 5: Organizing update logs..." -ForegroundColor Green
if (Test-Path "MDs\OCT_10_2025_UPDATES.md") {
    Move-Item "MDs\OCT_10_2025_UPDATES.md" "docs\updates\2025-10-10_QUIZ_UX.md" -Force
    Write-Host "  ✓ Moved OCT_10_2025_UPDATES.md → 2025-10-10_QUIZ_UX.md" -ForegroundColor Gray
}

# Step 6: Archive old/obsolete files
Write-Host "`nStep 6: Archiving old documentation..." -ForegroundColor Yellow

$archiveFiles = @(
    "MDs\current_progress_2025-09-30_GPT.md",
    "MDs\current_progress_2025-10-01_GPT.md",
    "MDs\current_progress_2025-10-01_auth_GPT.md",
    "MDs\plan_2025-10-02.md",
    "MDs\ENROLLMENT_FEATURE_COMPLETE.md",
    "MDs\ENROLLMENT_FIXES.md",
    "MDs\CHECKOUT_BACKLOG.md",
    "DOCUMENTATION_MAP.md",
    "MD_CLAUDE\PROGRESS_SESSION_2.md",
    "MD_CLAUDE\VISUAL_UPDATES.md",
    "MD_CLAUDE\JWT_AUTH_FIX.md",
    "MD_CLAUDE\BACKEND_FIXES_APPLIED.md",
    "MD_CLAUDE\CLAUDE_2025-10-07_CHANGES.md",
    "MD_CLAUDE\FEATURE_PLAN_DASHBOARD_CART.md",
    "MD_CLAUDE\NEXT_STEPS_PLAN.md",
    "MD_CLAUDE\QUICK_START.md",
    "MD_CLAUDE\BUGFIXES_2025_10_08.md",
    "MD_CLAUDE\SESSION_SUMMARY_2025_10_08.md",
    "MD_CLAUDE\CART_AND_PAYPAL_INTEGRATION_COMPLETE.md",
    "MD_CLAUDE\PAYPAL_SETUP_GUIDE.md"
)

$archivedCount = 0
foreach ($file in $archiveFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\" -Force
        Write-Host "  ✓ Archived $(Split-Path $file -Leaf)" -ForegroundColor Gray
        $archivedCount++
    }
}
Write-Host "  Archived $archivedCount files" -ForegroundColor Yellow

# Step 7: Delete useless files
Write-Host "`nStep 7: Cleaning up..." -ForegroundColor Green
if (Test-Path "New Text Document.txt") {
    Remove-Item "New Text Document.txt" -Force
    Write-Host "  ✓ Deleted 'New Text Document.txt'" -ForegroundColor Gray
}

# Summary
Write-Host "`n✅ Automatic reorganization complete!" -ForegroundColor Green
Write-Host "`n⚠️  Manual consolidation needed:" -ForegroundColor Yellow
Write-Host "   The following files need to be manually merged:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Architecture Docs → docs/architecture/TECHNICAL_ARCHITECTURE.md" -ForegroundColor Cyan
Write-Host "      Merge:" -ForegroundColor Gray
Write-Host "      - ARCHITECTURE_RECOMMENDATIONS.md" -ForegroundColor Gray
Write-Host "      - MDs/architecture_GPT.md" -ForegroundColor Gray
Write-Host "      - MDs/BACKEND_ARCHITECTURE_REVIEW_CLAUDE.md" -ForegroundColor Gray
Write-Host "      - MD_CLAUDE/BACKEND_COMPREHENSIVE_REVIEW.md" -ForegroundColor Gray
Write-Host "      - MD_CLAUDE/BACKEND_READY.md" -ForegroundColor Gray
Write-Host "      - MD_CLAUDE/COURSE_CONTENT_ARCHITECTURE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Quiz Docs → docs/features/QUIZ_SYSTEM.md" -ForegroundColor Cyan
Write-Host "      Merge:" -ForegroundColor Gray
Write-Host "      - QUIZ_BUILDER_COMPLETE.md" -ForegroundColor Gray
Write-Host "      - QUIZ_IMPROVEMENTS_SUMMARY.md" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Progress Docs → docs/features/PROGRESS_TRACKING.md" -ForegroundColor Cyan
Write-Host "      Merge:" -ForegroundColor Gray
Write-Host "      - PROGRESS_TRACKING_EXPLAINED.md" -ForegroundColor Gray
Write-Host "      - PROGRESS_TRACKING_FINAL_FIX_2025_10_09.md" -ForegroundColor Gray
Write-Host "      - DASHBOARD_FIX_2025_10_09.md" -ForegroundColor Gray
Write-Host ""
Write-Host "   4. Curriculum Docs → docs/features/CURRICULUM_BUILDER.md" -ForegroundColor Cyan
Write-Host "      Merge:" -ForegroundColor Gray
Write-Host "      - CURRICULUM_BUILDER_COMPLETE.md" -ForegroundColor Gray
Write-Host "      - CURRICULUM_BUILDER_FIXES.md" -ForegroundColor Gray
Write-Host "      - CONTENT_BUILDERS_PLAN.md" -ForegroundColor Gray
Write-Host ""
Write-Host "   5. Backlog Docs → docs/planning/BACKLOG.md" -ForegroundColor Cyan
Write-Host "      Merge:" -ForegroundColor Gray
Write-Host "      - MDs/COMPREHENSIVE_PRODUCT_BACKLOG.md" -ForegroundColor Gray
Write-Host "      - MDs/Backlog.md" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 See REORGANIZATION_GUIDE.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

