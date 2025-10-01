#!/usr/bin/env pwsh
Write-Host "Starting Student Clubs & Events System..." -ForegroundColor Green

# Kill any existing node processes
Write-Host "Stopping existing Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Start backend server
Write-Host "Starting backend server on port 5000..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
Start-Process powershell -ArgumentList "-Command", "npm start" -WindowStyle Minimized

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend server on port 3000..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
Start-Process powershell -ArgumentList "-Command", "npm run dev" -WindowStyle Minimized

Write-Host "Servers starting..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend: http://localhost:5000" -ForegroundColor White
Write-Host "Press Ctrl+C to stop servers" -ForegroundColor Yellow