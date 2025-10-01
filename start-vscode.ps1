# SEACM VS Code Terminal Startup

Write-Host "🚀 Starting SEACM in VS Code Terminals..." -ForegroundColor Green

# Kill existing processes first
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Get project root
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "📁 Project Root: $ProjectRoot" -ForegroundColor Cyan

# Set working directory
Set-Location $ProjectRoot

Write-Host "✅ Ready to start servers in VS Code terminals!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 To start Backend:" -ForegroundColor Cyan
Write-Host "   1. Open new terminal in VS Code (Ctrl+Shift+``)"
Write-Host "   2. Run: cd backend"
Write-Host "   3. Run: npm start"
Write-Host ""
Write-Host "⚡ To start Frontend:" -ForegroundColor Cyan  
Write-Host "   1. Open another new terminal in VS Code (Ctrl+Shift+``)"
Write-Host "   2. Run: cd frontend"
Write-Host "   3. Run: npm run dev"
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend:  http://localhost:5000"