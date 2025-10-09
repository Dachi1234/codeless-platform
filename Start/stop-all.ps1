# Codeless Full Stack Stop Script
# Stops all Java and Node processes (backend and frontend)
# Usage: .\stop-all.ps1

Write-Host "🛑 Stopping Codeless E-Learning Platform..." -ForegroundColor Cyan
Write-Host ""

# Stop Java processes (Spring Boot backend)
Write-Host "🔧 Stopping Backend (Java processes)..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    $javaProcesses | Stop-Process -Force
    Write-Host "   ✅ Stopped $($javaProcesses.Count) Java process(es)" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No Java processes found" -ForegroundColor Gray
}

# Stop Node processes (Angular frontend)
Write-Host "🎨 Stopping Frontend (Node processes)..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "   ✅ Stopped $($nodeProcesses.Count) Node process(es)" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No Node processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ All processes stopped!" -ForegroundColor Green
Write-Host ""

