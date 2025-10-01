@echo off
echo Starting SEACM Development Environment...
echo.

REM Kill existing node processes
taskkill /F /IM node.exe 2>nul

REM Change to script directory
cd /d "%~dp0"

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "start-dev.ps1"

pause