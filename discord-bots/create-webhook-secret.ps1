# ============================================================================
# Create Webhook Secret for n8n Callback Authentication
# ============================================================================

Write-Host "🔐 Creating webhook secret for n8n callback authentication..." -ForegroundColor Cyan
Write-Host ""

# Generate a secure random secret (32 characters)
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "✅ Generated secure secret:" -ForegroundColor Green
Write-Host $secret -ForegroundColor Yellow
Write-Host ""

# Save to file temporarily
$tempFile = "temp-webhook-secret.txt"
[System.IO.File]::WriteAllText($tempFile, $secret, [System.Text.Encoding]::UTF8)

Write-Host "📤 Creating secret in Google Secret Manager..." -ForegroundColor Cyan

try {
    # Create secret in Google Secret Manager
    gcloud secrets create DISCORD_WEBHOOK_SECRET `
        --data-file=$tempFile `
        --project=codeless-platform `
        2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Secret created successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Secret might already exist, updating..." -ForegroundColor Yellow
        
        # Try to create a new version
        gcloud secrets versions add DISCORD_WEBHOOK_SECRET `
            --data-file=$tempFile `
            --project=codeless-platform
    }
} catch {
    Write-Host "❌ Error creating secret: $_" -ForegroundColor Red
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ""
Write-Host "🔑 Granting access to Cloud Run service account..." -ForegroundColor Cyan

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding DISCORD_WEBHOOK_SECRET `
    --member="serviceAccount:231098067761-compute@developer.gserviceaccount.com" `
    --role="roles/secretmanager.secretAccessor" `
    --project=codeless-platform `
    2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Permissions granted!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Permissions might already exist (this is okay)" -ForegroundColor Yellow
}

# Clean up
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ WEBHOOK SECRET CREATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Copy this secret to use in your n8n HTTP Request node:" -ForegroundColor White
Write-Host ""
Write-Host "   Authorization Header:" -ForegroundColor Cyan
Write-Host "   Bearer $secret" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Steps to configure n8n:" -ForegroundColor White
Write-Host "   1. In your n8n workflow, add HTTP Request node at the END" -ForegroundColor Gray
Write-Host "   2. Set Authentication: Header Auth" -ForegroundColor Gray
Write-Host "   3. Header Name: Authorization" -ForegroundColor Gray
Write-Host "   4. Header Value: Bearer $secret" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Save secret to clipboard if possible
try {
    "Bearer $secret" | Set-Clipboard
    Write-Host "📋 Secret copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not copy to clipboard (install clip.exe)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your n8n workflows with the Authorization header above" -ForegroundColor White
Write-Host "2. Push code to Git (will trigger deployment)" -ForegroundColor White
Write-Host "3. Test with @Giorgi in Discord" -ForegroundColor White
Write-Host ""

