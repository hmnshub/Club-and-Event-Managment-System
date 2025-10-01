# Start Student Clubs & Events System
Write-Host "Starting Student Clubs & Events System..." -ForegroundColor Green

# Start backend in background
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-Command", "cd 'C:\SEACM\backend'; node src/server.js" -WindowStyle Minimized

# Wait a moment
Start-Sleep -Seconds 3

# Start frontend in background  
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-Command", "cd 'C:\SEACM\frontend'; npm run dev" -WindowStyle Minimized

Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000 (or next available port)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Important: You still need to update your Google Cloud Console:" -ForegroundColor Red
Write-Host "1. Go to https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Navigate to APIs & Services → Credentials" -ForegroundColor White
Write-Host "3. Edit your OAuth client ID" -ForegroundColor White
Write-Host "4. Add these Authorized JavaScript origins:" -ForegroundColor White
Write-Host "   - http://localhost:3001" -ForegroundColor White
Write-Host "   - http://localhost:3002" -ForegroundColor White  
Write-Host "   - http://localhost:3003" -ForegroundColor White
Write-Host "5. Save changes" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
