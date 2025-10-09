# Codeless Backend Startup Script
# Usage: .\start-backend.ps1

Write-Host "🚀 Starting Codeless Backend..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location -Path "backend\codeless-backend"

# Check if PostgreSQL is running (optional check)
Write-Host "📊 Checking database connection..." -ForegroundColor Yellow
$pgRunning = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($pgRunning) {
    Write-Host "✅ PostgreSQL is running on port 5432" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: PostgreSQL might not be running on port 5432" -ForegroundColor Yellow
    Write-Host "   Make sure your database is running before continuing." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (Y/n)"
    if ($continue -eq "n" -or $continue -eq "N") {
        Write-Host "Startup cancelled." -ForegroundColor Red
        Set-Location -Path "..\..\"
        exit
    }
}

Write-Host ""
Write-Host "🔨 Building and starting Spring Boot application..." -ForegroundColor Cyan
Write-Host "   (This may take a minute on first run)" -ForegroundColor Gray
Write-Host ""

# Start Spring Boot
.\mvnw.cmd spring-boot:run

# Return to root directory when done
Set-Location -Path "..\..\"

