#!/usr/bin/env pwsh
param(
    [switch]$Force
)

Write-Host "🚀 Starting SEACM Development Servers..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan

# Set proper working directory
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

Write-Host "📁 Project Directory: $ProjectRoot" -ForegroundColor Yellow

# Function to kill processes on specific ports
function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($processes) {
            foreach ($pid in $processes) {
                Write-Host "🔥 Killing process $pid on port $Port..." -ForegroundColor Red
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        Write-Host "⚠️  No processes found on port $Port" -ForegroundColor Yellow
    }
}

# Clean up existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Stop-ProcessOnPort -Port 3000
Stop-ProcessOnPort -Port 3001
Stop-ProcessOnPort -Port 5000

# Wait a moment for cleanup
Start-Sleep -Seconds 2

# Verify directories exist
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"

if (-not (Test-Path $BackendPath)) {
    Write-Error "❌ Backend directory not found: $BackendPath"
    exit 1
}

if (-not (Test-Path $FrontendPath)) {
    Write-Error "❌ Frontend directory not found: $FrontendPath"
    exit 1
}

# Start Backend Server
Write-Host "🔧 Starting Backend Server (Port 5000)..." -ForegroundColor Cyan
$BackendJob = Start-Job -ScriptBlock {
    param($BackendPath)
    Set-Location $BackendPath
    npm start
} -ArgumentList $BackendPath

# Wait for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "⚡ Starting Frontend Server (Port 3000/3001)..." -ForegroundColor Cyan
$FrontendJob = Start-Job -ScriptBlock {
    param($FrontendPath)
    Set-Location $FrontendPath
    npm run dev
} -ArgumentList $FrontendPath

# Monitor jobs
Write-Host "📊 Monitoring servers..." -ForegroundColor Green
Write-Host "Frontend Job ID: $($FrontendJob.Id)" -ForegroundColor White
Write-Host "Backend Job ID: $($BackendJob.Id)" -ForegroundColor White

# Wait and check status
Start-Sleep -Seconds 5

# Check if jobs are running
$BackendStatus = Get-Job -Id $BackendJob.Id
$FrontendStatus = Get-Job -Id $FrontendJob.Id

Write-Host "`n📈 Server Status:" -ForegroundColor Green
Write-Host "Backend: $($BackendStatus.State)" -ForegroundColor $(if ($BackendStatus.State -eq 'Running') { 'Green' } else { 'Red' })
Write-Host "Frontend: $($FrontendStatus.State)" -ForegroundColor $(if ($FrontendStatus.State -eq 'Running') { 'Green' } else { 'Red' })

# Display access URLs
Write-Host "`n🌐 Access your application:" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000 or http://localhost:3001" -ForegroundColor White
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White

Write-Host "`n📝 Commands:" -ForegroundColor Yellow
Write-Host "- View backend logs: Receive-Job -Id $($BackendJob.Id) -Keep" -ForegroundColor Gray
Write-Host "- View frontend logs: Receive-Job -Id $($FrontendJob.Id) -Keep" -ForegroundColor Gray
Write-Host "- Stop servers: Stop-Job -Id $($BackendJob.Id), $($FrontendJob.Id)" -ForegroundColor Gray

Write-Host "`n✅ Servers started! Press Ctrl+C to stop." -ForegroundColor Green

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 10
        $BackendAlive = (Get-Job -Id $BackendJob.Id).State -eq 'Running'
        $FrontendAlive = (Get-Job -Id $FrontendJob.Id).State -eq 'Running'
        
        if (-not $BackendAlive -or -not $FrontendAlive) {
            Write-Host "⚠️  One or more servers stopped!" -ForegroundColor Red
            if (-not $BackendAlive) {
                Write-Host "Backend Error:" -ForegroundColor Red
                Receive-Job -Id $BackendJob.Id
            }
            if (-not $FrontendAlive) {
                Write-Host "Frontend Error:" -ForegroundColor Red
                Receive-Job -Id $FrontendJob.Id
            }
            break
        }
    }
} finally {
    Write-Host "`n🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Id $BackendJob.Id, $FrontendJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $BackendJob.Id, $FrontendJob.Id -ErrorAction SilentlyContinue
}