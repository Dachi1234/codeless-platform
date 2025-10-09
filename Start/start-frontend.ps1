# Codeless Frontend Startup Script
# Usage: .\start-frontend.ps1

Write-Host "🎨 Starting Codeless Frontend..." -ForegroundColor Cyan
Write-Host ""

# Change to frontend directory
Set-Location -Path "frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed!" -ForegroundColor Red
        Set-Location -Path ".."
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🚀 Starting Angular development server..." -ForegroundColor Cyan
Write-Host "   Opening at http://localhost:4200" -ForegroundColor Gray
Write-Host ""

# Start Angular dev server
npm start

# Return to root directory when done
Set-Location -Path ".."

