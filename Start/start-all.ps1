# Codeless Full Stack Startup Script
# Starts both backend and frontend in separate PowerShell windows
# Usage: .\start-all.ps1

Write-Host "🚀 Starting Codeless E-Learning Platform..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend\codeless-backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Starting components:" -ForegroundColor Yellow
Write-Host "   1. Backend  → http://localhost:8080" -ForegroundColor Gray
Write-Host "   2. Frontend → http://localhost:4200" -ForegroundColor Gray
Write-Host ""

# Start Backend in new PowerShell window
Write-Host "🔧 Launching Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { Set-Location '$PWD'; .\start-backend.ps1 }"

# Wait a moment before starting frontend
Write-Host "⏳ Waiting 3 seconds before starting frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend in new PowerShell window
Write-Host "🎨 Launching Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { Set-Location '$PWD'; .\start-frontend.ps1 }"

Write-Host ""
Write-Host "✅ Both components are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Access points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "   Swagger:  http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Keep the PowerShell windows open to see logs" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
Write-Host ""

