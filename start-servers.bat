@echo off
echo Starting Student Clubs & Events System...

REM Kill any existing node processes
taskkill /F /IM node.exe 2>nul

echo Starting backend server...
cd /d "C:\SEACM\backend"
start /min "Backend Server" node src/server.js

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting frontend server...
cd /d "C:\SEACM\frontend"
start /min "Frontend Server" npm run dev

echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000 (or next available port)
echo.
echo Servers are running in minimized windows.
echo Close this window when done.
pause
