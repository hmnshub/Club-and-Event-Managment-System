Write-Host "Starting SEACM Development Servers..." -ForegroundColor Green

# Kill existing processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Get script directory and navigate there
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Working Directory: $ScriptDir" -ForegroundColor Cyan

# Start Backend in new window
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$BackendPath = Join-Path $ScriptDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; npm start"

# Wait for backend
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan  
$FrontendPath = Join-Path $ScriptDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; npm run dev"

Write-Host "Servers are starting in separate windows!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000 (or 3001)" -ForegroundColor White
Write-Host "Backend: http://localhost:5000 (or 5001)" -ForegroundColor White