Write-Host "🚀 Starting SEACM Development Servers..." -ForegroundColor Green

# Kill existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cleaned up existing Node.js processes" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No existing processes to clean up" -ForegroundColor Yellow
}

# Wait for cleanup
Start-Sleep -Seconds 2

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "📁 Working Directory: $ScriptDir" -ForegroundColor Cyan

# Start Backend
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
$BackendPath = Join-Path $ScriptDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm start" -WindowStyle Normal

# Wait for backend
Start-Sleep -Seconds 3

# Start Frontend  
Write-Host "⚡ Starting Frontend Server..." -ForegroundColor Cyan
$FrontendPath = Join-Path $ScriptDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host "✅ Servers are starting in separate windows!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000 (or 3001 if 3000 is busy)" -ForegroundColor White
Write-Host "🌐 Backend: http://localhost:5000 (or 5001 if 5000 is busy)" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
Read-Host